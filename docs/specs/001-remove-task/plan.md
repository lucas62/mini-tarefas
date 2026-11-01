# Plan - 001 Remove a task by id

Spec: ./spec.md

## Needs approval
- [x] New dependencies: none
- [x] Migrations / data changes: none (`tarefas.json` format unchanged)
- [x] Public API / contract changes: additive CLI command `rm <id>` only (approved via spec)
- [x] CI/CD / build config: none

## Approach
- Domain: new pure function `removeTask(tasks, id)` in `src/tasks.js` that returns the new array and throws `tarefa <id> não existe` (same message as `completeTask`). The CLI reads the title before removing.
- Id validation (`id inválido`) lives in `removeTask` too: throws when `id` is not a positive integer (`Number.isInteger(id) && id > 0`). The CLI passes `Number(args[0])` (`Number(undefined)` = NaN, `Number('abc')` = NaN, `1.5` not integer).
- CLI: `rm` branch in `src/cli.js` -> prints `- <id> <título>`, saves; usage text gains `rm <id>`. Errors flow through the existing `catch` (`erro: <msg>`, exit 1); `save` runs only after success, so the list is unchanged on error.

## Alternatives considered
- **Chosen:** validation inside `removeTask`, because it is unit-testable without spawning a process and keeps `cli.js` thin.
- **Rejected:** validating the id in `cli.js` only - leaves AC4 testable only through a slow process-level test and duplicates logic if `done` later wants the same rule.
- **Rejected:** soft delete (`removed: true` flag) - not requested, changes the file format.

## Affected code
| Area / file | Change |
| --- | --- |
| `src/tasks.js` | add `removeTask` |
| `src/cli.js` | `rm` branch + usage text |
| `test/tasks.test.js` | unit tests for `removeTask` |
| `test/cli.test.js` (new) | process-level tests for output, exit code and file persistence |

## Data model & contracts
No schema change. CLI: `rm <id>` -> stdout `- <id> <título>`, exit 0 | stderr `erro: tarefa <id> não existe` / `erro: id inválido`, exit 1.

## Test strategy (evidence path)
| Claim (AC or invariant) | Evidence | Seam / method | Limits (what it can't show) |
| --- | --- | --- | --- |
| AC1 removal + output + exit 0 | test: add 2, `rm 1`, assert stdout `- 1 a`, exit 0, file has only task 2 | `test/cli.test.js`, spawn `node src/cli.js` with `TAREFAS_FILE` in a temp dir | concurrent runs |
| AC2 completed task removable | unit: `removeTask` on a done task | `test/tasks.test.js` | - |
| AC3 unknown id | unit: throws `/não existe/`; cli: stderr `erro: tarefa 9 não existe`, exit 1, file unchanged | both seams (unit owns message, cli owns exit code/no-write) | - |
| AC4 invalid id | unit: `NaN`, `1.5`, `0`, `-1` throw `/id inválido/`; cli: `rm` with no arg -> exit 1 | unit + one cli case | - |
| AC5 usage text | cli: unknown command stdout contains `rm <id>` | `test/cli.test.js` | - |
| Invariant: existing add/done/list unchanged | existing 5 tests | `npm test` | CLI paths of add/done/list stay untested |

Verification affordance: `TAREFAS_FILE` env (already exists) + temp dir per test - durable.

## Risks, rollout & rollback
- Risk: id reuse after removing the highest id (accepted in spec, A6).
- Rollout/rollback: single commit; revert the commit.

## Deviations (filled during /wf-build)
- Shipped as one commit per task (T01-T03) instead of a single commit; rollback = revert the 3 feat commits.
