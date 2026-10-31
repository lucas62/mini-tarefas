---
name: wf-review
description: Review a branch on three separate axes - Standards, Spec and Defects - each by a fresh read-only reviewer running in parallel, reported side by side and never blended. Use after /wf-build finishes and before /wf-ship, or when asked to review changes "since X" or to review a branch.
argument-hint: "[fixed point: branch, tag or commit; default merge-base with main] [optional focus]"
---

# /wf-review - three axes, three fresh reviewers

Adapted from Matt Pocock's `code-review` skill (MIT); the third axis (Defects) is this kit's addition. See `THIRD_PARTY_NOTICES.md`.

Arguments: `$ARGUMENTS`

A change can pass one axis and fail another: code that follows every standard but builds the wrong thing, or does what the spec asked while breaking conventions, or matches both and still has a bug. Separate reviewers with fresh context stop one axis from masking another.

## 1. Pin the fixed point
- Fixed point = the first argument if it resolves as a git ref (`git rev-parse <ref>`); otherwise the merge-base with `main` or `master` (`git merge-base HEAD <base>`). Any remaining text is a focus hint passed to every reviewer.
- Capture `git diff <fp>...HEAD` (three dots) and `git log <fp>..HEAD --oneline`. Confirm the ref resolves and the diff is non-empty BEFORE spawning anything.
- Uncommitted changes: mention them and review them too (`git diff HEAD`).

## 2. Gather sources (pass pointers, not pasted content)
- **Spec:** the active spec folder (`docs/specs/.active`, else the newest folder with open tasks): `spec.md`, `plan.md`, `tasks.md`. None found: skip the Spec axis and say so.
- **Standards:** `AGENTS.md`, `.claude/rules/*.md`, `docs/CODING_STANDARDS.md` (if present), `CONTRIBUTING.md`, and linter / formatter / tsconfig files (to know what tooling already enforces).

## 3. Spawn three `wf-reviewer` subagents in parallel
Send all three Agent calls in ONE message, foreground, each with a fresh context. Every brief: the diff command and commit list, the relevant file pointers, the focus hint, and "under 400 words, cite `path:line`, label each finding blocker / major / minor / nit, end with a *Not verified* line, modify nothing".

**Standards reviewer.** Report (a) every violation of a documented standard, citing the file and the rule, and (b) baseline smells. Skip anything tooling already enforces. A documented repo standard always overrides the baseline. Smell baseline, all judgement calls ("possible Feature Envy"), never hard violations: Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man, Refused Bequest. Quote the hunk for each.

**Spec reviewer.** Report (a) requirements or acceptance criteria that are missing or only partly done, (b) behavior in the diff nobody asked for (scope creep), (c) criteria that look done but look wrong. Quote the spec line for each finding and include an AC coverage table with columns `AC | implemented at | tested at | status`. Both locations must be `path:line` in the diff or the repo. **An AC without a `path:line` for its implementation AND for its test counts as not covered**, whatever the code looks like: status `not covered`, severity at least major (blocker for a P1 story). "Looks implemented" or a file name without a line is not evidence. Also flag plan deviations that were not recorded.

**Defects reviewer.** Report correctness bugs (logic, unhandled errors, races, null paths, time zones), security issues (injection, authz gaps, secrets, PII in logs; on mobile deep links, WebView, insecure storage), test quality (asserting behavior vs implementation, missing negative and edge cases), and performance or operations risks (N+1 queries, unbounded lists, re-renders, missing migration or rollback).

## 4. Aggregate
Present `## Standards`, `## Spec`, `## Defects` verbatim or lightly cleaned. Do NOT merge, de-duplicate across axes or re-rank. Finish with one line per axis: finding count and its worst finding, then `AC covered: <n>/<total>` from the Spec table, then `Blockers in: <axes or none>`. Do not edit code here; fixing is the user's call or a follow-up `/wf-build` task.

## 5. Converge (optional, append-only)
Inspired by the `converge` step of GitHub's Spec Kit. If the Spec axis found requirements that are missing, partial or wrong, offer to record them as work: append a `## Convergence` section to `tasks.md` with one new unchecked task per gap (same format: `Story`, `Blocked by`, `Covers`, `Done when`), then suggest `/wf-build` to finish them. Strictly append-only: never edit or renumber existing tasks, never touch `spec.md` or `plan.md` (if the spec itself is wrong, say so and stop). If the Spec axis is clean, change nothing.
