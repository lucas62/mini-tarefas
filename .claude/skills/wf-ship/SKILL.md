---
name: wf-ship
description: Final gate and delivery - run full verification, update docs and spec status, push the feature branch and open a pull request. Use when the work is done and reviewed.
argument-hint: "[optional PR title or notes]"
disable-model-invocation: true
---

# /wf-ship - verify, document, open the PR (never merge)

Notes from the user: `$ARGUMENTS`

## Steps
1. **Preconditions.** Current branch must not be protected. Working tree must contain only intended changes. If `tasks.md` has unchecked tasks, list them and ask whether to proceed.
2. **Full verification.** Run typecheck, lint, tests, and build (if defined in `AGENTS.md`) via the `wf-verifier` subagent. Anything red blocks shipping: fix it or stop and report.
3. **Review gate.** If `/wf-review` has not run on this branch in this session, run it now and resolve every *blocker* and *major* finding (or get explicit user sign-off to defer).
4. **Docs.** Update `CHANGELOG.md` if the repo keeps one. Set spec `Status: shipped`. If `.claude/rules/release.md` exists, follow it (release channel, store/OTA notes, migrations order).
5. **Commit hygiene.** Make sure commits are Conventional Commits. Squash noise only if the user asks.
6. **Push and PR.** `git push -u origin <branch>`, then write the PR body to a temporary file and run `gh pr create --title ... --body-file <file>` (a file avoids shell-quoting problems on every OS). If `gh` is unavailable, print the title and body for the user to paste. The body follows this shape (adapted from Matt Pocock's `pr` skill, MIT, which credits Dex Horthy's `show-me`; see `THIRD_PARTY_NOTICES.md`). Skip preambles, keep prose brief, use the glossary's vocabulary:

   ```markdown
   ## Summary
   <the smallest view that makes the point: pseudocode for logic, a call tree for runtime flow,
   a component tree for UI, a shallow file tree or a `diff` sketch for a refactor, Mermaid for interactions>
   Spec: <link to docs/specs/NNN-slug/>

   ## Evidence
   - **Before:** <screenshot / output / failing test run>
     **After:** <screenshot / output / passing test run>
   (UI changes: ask the user for screenshots if you cannot produce them.)

   ## Merge Danger
   **Door:** one-way | two-way   (can this be undone by reverting the PR? migrations, published contracts, store releases, sent notifications are one-way)
   **Blast Radius:** <one word: e.g. "local", "module", "all users">
   <optional: ramifications, rollout / rollback, OTA vs new binary for mobile>
   ```
7. **Report** the PR URL and anything unverified. Do not merge, do not delete branches.
