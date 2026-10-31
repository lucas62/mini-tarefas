---
name: wf-learn
description: Turn a correction, review finding, bug or incident into a durable improvement in the right place - a deterministic check first (lint rule, hook, CI), else a scoped rule, review standard, AGENTS.md pointer, skill edit or ADR. Use whenever the user corrects the same thing twice, after a review or post-mortem, or at the end of a rough session.
argument-hint: "[what went wrong or what to remember; default: the last correction]"
disable-model-invocation: true
---

# /wf-learn - improve the agent's environment, cheapest durable fix first

Adapted from Matt Pocock's `retro` skill (MIT). See `THIRD_PARTY_NOTICES.md`.

Lesson: `$ARGUMENTS` (if empty, infer it from the last correction or from this session, and confirm in one line).

## Principles
- Work happens in two stages. The **implementer** carries the most context pressure (exploring, coding, debugging). The **reviewer** gets only a diff, so it has the spare capacity to impose standards. Put judgement-call rules where the reviewer reads them, not in the implementer's always-loaded context.
- `AGENTS.md` / `CLAUDE.md` are loaded every session. Keep them to facts and **navigation pointers** (where things live, what command to run). Every line must change behavior; remove no-ops.
- A rule the agent can break silently is weaker than a check that fails loudly.

## Steps
1. **State the lesson** as one concrete, verifiable sentence. "Format code properly" is useless; "API handlers live in `src/api/handlers/`" is a rule.
2. **Classify the failure.**
   - **Mechanical** (a fixed pattern, banned API, import shape, file location, formatting, types) -> build or fix a **deterministic check**. First read the repo's own `lint` / `typecheck` / `check` scripts and CI workflow: the finding may be a check that exists but is unwired, disabled or silently broken. Otherwise add a custom lint rule, a `tsconfig` strictness flag, a pre-commit step, a CI job, or a hook in `.claude/hooks/`. A repo with no guardrail at all is itself a finding.
   - **Judgement call** (cross-file consistency, "matches the surrounding style", naming, design taste) -> `docs/CODING_STANDARDS.md`, which `/wf-review` reads. Not `AGENTS.md`.
   - **Path-specific guidance** -> `.claude/rules/<topic>.md` with `paths:` frontmatter, so it loads only on matching files.
   - **Needed in nearly every session** (a command, a layout fact, a pointer) -> `AGENTS.md`, one line.
   - **The workflow itself should change** -> edit `.claude/skills/wf-*`. Kit-managed skills are overwritten by `bootstrap.mjs --update`, so also apply the change in the kit repo.
   - **A decision with trade-offs** -> `docs/adr/`.
   - **One-off, or derivable from the code** -> nowhere; say so and stop.
3. **Check for conflicts and bloat.** Search the destination, `AGENTS.md`, `.claude/rules/` and `docs/CODING_STANDARDS.md` for contradicting or duplicate rules; merge or delete instead of adding. If `AGENTS.md` is past ~150 lines, propose moving or deleting entries.
4. **Show the exact diff** and wait for approval. Never edit hooks or settings without it.
5. **Apply**, then report where the lesson now lives and when it loads (always / on matching files / at review / on failure of a check).
6. **Other signals worth a line** when you see them in the session: navigation (the agent took long to find a file -> add a pointer), tool economy (an expensive call that a script could replace), information access (a log or service the agent could not see).
