# 001 - Remove a task by id

Status: in-progress
Date: 2026-10-31

## Assumptions (written first)
| # | Assumption | Source (said by user / read in <file> / guess) | Status (confirmed / rejected / open) |
| --- | --- | --- | --- |
| A1 | New command `rm <id>` removes the task with that id | said by user | confirmed |
| A2 | Unknown id gives a clear error | said by user | confirmed |
| A3 | Errors print `erro: <msg>` to stderr with exit code 1, like the other commands | read in `src/cli.js` | confirmed |
| A4 | Unknown-id message follows the existing `tarefa <id> não existe` | read in `src/tasks.js` | confirmed |
| A5 | Ids are sequential integers; next id = highest existing + 1 | read in `src/tasks.js` | confirmed |
| A6 | Removing the highest-id task lets its id be reused by the next `add` (accepted) | read in `src/tasks.js` | confirmed |
| A7 | Works on open and completed tasks | guess | confirmed |
| A8 | No confirmation prompt | guess | confirmed |
| A9 | Missing or non-integer id gives its own clear error (`id inválido`) | guess | confirmed |
| A10 | One id per command | guess | confirmed |
| A11 | Success prints `- <id> <título>` | guess | confirmed |
| A12 | Usage text lists `rm <id>` | guess | confirmed |

## Problem
A user of the CLI can add and complete tasks but cannot get rid of a wrong or obsolete one; the only way today is editing the JSON file by hand.

## Goal
`rm <id>` deletes exactly that task; invalid requests fail with a clear message and change nothing.

## Non-goals
- Removing several ids at once, by filter, or "clear completed".
- Confirmation prompt or undo.
- Preventing id reuse after removing the highest id (A6).

## User stories (prioritized, each independently testable)

### US1 (P1) - Remove an existing task
As a CLI user, I want to remove a task by its id, so that my list only has tasks I care about.
- **Why this priority:** it is the feature.
- **Independent test:** add 2 tasks, `rm 1`, `list` shows only task 2.
- **AC1** - Given tasks 1 and 2 exist, when I run `rm 1`, then task 1 is no longer in the list, task 2 is unchanged, and `- 1 <título>` is printed with exit code 0.
- **AC2** - Given task 1 is completed, when I run `rm 1`, then it is removed the same way.

### US2 (P1) - Clear error for an invalid id
As a CLI user, I want a clear error when the id is wrong, so that I know nothing was removed.
- **Why this priority:** explicitly requested; prevents silent no-ops.
- **Independent test:** run `rm 9` on a list without task 9 and check stderr, exit code and the unchanged list.
- **AC3** - Given no task 9 exists, when I run `rm 9`, then `erro: tarefa 9 não existe` is printed to stderr, exit code is 1, and the list is unchanged.
- **AC4** - Given any list, when I run `rm` with no id or a non-integer id (e.g. `rm abc`), then `erro: id inválido` is printed to stderr, exit code is 1, and the list is unchanged.

### US3 (P3) - Discoverability
- **AC5** - When I run the CLI with an unknown command, the usage text includes `rm <id>`.

## Edge cases & failure modes
- Empty list: `rm 1` -> AC3.
- Invalid input: missing, `abc`, `1.5`, `0`, negative -> AC4 for non-integers; integers with no task -> AC3.
- Missing/corrupt data file: loads as empty list (existing behavior) -> AC3.
- Concurrency: two simultaneous CLI runs may lose a write (pre-existing, out of scope).

## Interfaces (what, not how)
CLI: `rm <id>` -> stdout `- <id> <título>` / stderr `erro: ...`, exit 0/1.

## Open questions
- (none)

## Risks
- Risk: id reuse (A6) could confuse a user who remembers an old id. Accepted.
