---
name: wf-build
description: Implement the active spec task by task from tasks.md - take the next unblocked task, test first at the agreed seams, verify, commit per task, stop on ambiguity. Run after /wf-plan is approved.
argument-hint: "[T03 | T01-T04 | all]  (default: all remaining)"
disable-model-invocation: true
---

# /wf-build - execute the plan, one verified slice at a time

Scope: `$ARGUMENTS` (task id, range, or `all`). Default: all remaining unchecked tasks.

## Before starting
1. Read the active spec folder (`docs/specs/.active`): `spec.md`, `plan.md`, `tasks.md`, plus `AGENTS.md`. Refuse to proceed if the spec is not approved or the plan has unapproved items under *Needs approval*.
2. Make sure you are not on a protected branch. If you are, `git switch -c feat/<slug>` (slug from the spec folder).
3. Check the working tree. If it has unrelated uncommitted changes, stop and ask.

## Pick the next task (the frontier)
Take the first unchecked task whose `Blocked by` tasks are all ticked. If none qualifies but unchecked tasks remain, the graph has a cycle or a missing dependency: stop and report it.

## For each task
1. **Restate** the task and its *Done when* check in one line.
2. **Test first, at the agreed seams.** Follow `/wf-tdd`: the seams named in `plan.md` *Test strategy* are the agreement; if the task needs a seam that is not there, ask before inventing one. One failing test, minimal code, repeat. For pure layout or config work, define a concrete manual check instead and say so.
3. **Implement the minimum** that satisfies the task. Follow existing patterns; no drive-by refactors. Refactor only when green, in its own commit.
4. **Verify.** Run the typecheck, lint and test commands from `AGENTS.md`: typecheck and the single relevant test file often, the full suite once at the end of the task. Delegate noisy runs to the `wf-verifier` subagent and act on its summary.
5. **Fix forward.** On failure, fix and re-run. If the failure is unexpected or its cause is unclear after one attempt, switch to `/wf-fix` instead of guessing. After 3 failed attempts on the same failure, stop and report what you tried and what you suspect.
6. **Close the task.** Tick it in `tasks.md` (`- [x]`), then commit with a Conventional Commit message that mentions the task id. Stage files explicitly (no blind `git add -A`).

## Stop and ask when
- The spec is ambiguous or two requirements conflict.
- The plan turns out to be wrong. Record it in `plan.md` under *Deviations*, tell the user, and wait.
- You need a new dependency, a migration, a contract change, or a CI/build-config change that was not approved in the plan.
- A hook blocks an action. Do not look for a way around it.

## When finished
Summarize: tasks completed, tests added, deviations, anything unverified. Suggest `/wf-review` next. Never push or open a PR here; that is `/wf-ship`.
