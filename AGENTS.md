# mini-tarefas

> Source of truth for every AI agent working in this repo (Claude Code, Codex, Cursor...). `CLAUDE.md` imports this file.
> Keep it short (aim < 150 lines) and limited to facts an agent cannot derive from the code. Procedures belong in skills, file-scoped guidance in `.claude/rules/`, enforcement in hooks.

## What this is
TODO(init): 2-3 lines - what the product does and who uses it.

## Stack
- Stack: Generic (stack not detected - fill in)
- Package manager: npm
- Language: TODO(init): confirm language

## Commands
| Task | Command |
| --- | --- |
| Dev / run | `npm run start` |
| Build | TODO(init): define |
| Typecheck | TODO(init): define |
| Lint | TODO(init): define |
| Test | `npm run test` |
| Format | TODO(init): define |

Run typecheck + lint + tests before declaring any task done, and report the real output.

## Architecture
TODO(init): layers/modules and where things live (3-8 bullets). Entry points and the main data flow.


## Conventions
- Conventional Commits (`feat:`, `fix:`, `chore:` ...), one concern per commit. Branches: `feat/<slug>`, `fix/<slug>`.
- Small, reviewable diffs. No drive-by refactors outside the task.
- New behavior needs a test, or an explicit note on why it cannot be tested.
- Never guess APIs or versions: read the code, `package.json`, or the docs.
- Domain vocabulary lives in `docs/GLOSSARY.md`: use its terms in specs, code and tests; refine it with `/wf-domain`.
- Mechanical rules live in lint / typecheck / hooks, not in prose. Judgement-call standards live in `docs/CODING_STANDARDS.md` and are checked at review.

## Workflow (spec-driven)
Non-trivial work goes through written artifacts in `docs/specs/NNN-slug/` (`spec.md` -> `plan.md` -> `tasks.md`):
`/wf-spec` -> `/wf-plan` -> `/wf-build` -> `/wf-review` -> `/wf-ship`. Tests are written first at the seams agreed in the plan (`/wf-tdd`).
Bugs go through `/wf-fix` (feedback loop first, no guessing). Run `/wf-learn` after any correction so the lesson sticks.
Small fixes (typo, one-line bug) may skip the spec; say so explicitly.

## Boundaries
- Always: run the verification commands; keep `tasks.md` up to date; follow existing patterns.
- Ask first: new dependencies, DB migrations, public API / contract changes, CI/CD or build-config changes, anything touching auth or payments.
- Never: commit secrets or `.env` files, push to a protected branch, force-push, hand-edit lockfiles, skip hooks (`--no-verify`).
