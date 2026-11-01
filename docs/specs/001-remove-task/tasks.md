# Tasks - 001 Remove a task by id

`[P]` = safe to run in parallel with other `[P]` tasks whose blockers are done.

- [x] T01 Remove an existing task via `rm <id>` (US1) - files: `src/tasks.js`, `src/cli.js`, `test/tasks.test.js`, `test/cli.test.js`
  - Story: US1
  - Blocked by: none
  - Covers: AC1, AC2
  - Done when: `npm test` passes with new tests for AC1 (cli) and AC2 (unit), written failing first
- [ ] T02 Reject unknown and invalid ids with a clear error (US2) - files: `src/tasks.js`, `test/tasks.test.js`, `test/cli.test.js`
  - Story: US2
  - Blocked by: T01
  - Covers: AC3, AC4
  - Done when: `npm test` passes; `rm 9` and `rm` print the spec'd `erro:` lines, exit 1, file unchanged
- [ ] T03 List `rm <id>` in the usage text (US3) - files: `src/cli.js`, `test/cli.test.js`
  - Story: US3
  - Blocked by: T01
  - Covers: AC5
  - Done when: `npm test` passes with a cli test asserting the usage text
