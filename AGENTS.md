# mini-tarefas

> Source of truth for every AI agent working in this repo (Claude Code, Codex, Cursor...). `CLAUDE.md` imports this file.
> Keep it short (aim < 150 lines) and limited to facts an agent cannot derive from the code. Procedures belong in skills, file-scoped guidance in `.claude/rules/`, enforcement in hooks.

## What this is
Minimal command-line to-do list (`add`, `done`, `rm`, `list [--open]`), per `README.md` and `package.json`. It is a prototype to validate ai-workflow-kit v0.4.0 (`package.json` description).
Users: a single developer running it locally [a confirmar].

## Stack
- Stack: Node.js >= 18 CLI, ES modules, zero dependencies (`package.json`)
- Package manager: npm
- Language: JavaScript (no TypeScript; `src/*.js`). UI strings and messages in Portuguese (`src/cli.js`)

## Commands
| Task | Command |
| --- | --- |
| Dev / run | `npm run start` |
| Build | none (plain Node, no build step) |
| Typecheck | none (plain JS; no tsconfig / JSDoc check) |
| Lint | none configured |
| Test | `npm test` (`node --test`, runs `test/*.test.js`) |
| Format | none configured |

Run tests (typecheck/lint not configured) before declaring any task done, and report the real output.

## Architecture
- `src/cli.js`: entry point; parses argv, loads, calls a rule, saves, prints.
- `src/tasks.js`: pure domain rules (`addTask`, `completeTask`, `removeTask`, `listTasks`), no I/O, return new arrays (immutable).
- `src/store.js`: JSON file persistence; file from `TAREFAS_FILE` env, default `tarefas.json` in cwd.
- `test/tasks.test.js`: unit tests for `src/tasks.js`; `test/cli.test.js`: process-level CLI tests (temp `TAREFAS_FILE`). `store.js` has no direct tests.
- Flow: argv -> `load` -> rule in `tasks.js` -> `save` -> stdout; errors become `erro: <msg>` on stderr with exit code 1.
- New rules go in `tasks.js` as pure functions that throw `Error` for invalid input [a confirmar].


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
