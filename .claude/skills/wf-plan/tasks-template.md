# Tasks - NNN Title

Each task is a **vertical slice** (tracer bullet): a narrow but complete path through every layer it touches (schema, API, UI, tests), demoable or verifiable on its own, small enough for one fresh context window. Prefactoring comes first. Tick the box only after *Done when* passes.

Keep the checkbox line exactly as `- [ ] Txx ...` (tooling counts these lines); put details in the indented bullets.
`[P]` = safe to run in parallel with other `[P]` tasks whose blockers are done.

- [ ] T01 Prefactor: make the change easy - files: `src/...`
  - Story: -
  - Blocked by: none
  - Covers: -
  - Done when: existing tests still pass (`<command>`)
- [ ] T02 Imperative, specific title (US1) - files: `src/...`
  - Story: US1
  - Blocked by: T01
  - Covers: AC1, AC2
  - Done when: `<command that must pass>` / <observable behavior>
- [ ] T03 [P] ...
  - Story: US2
  - Blocked by: T01
  - Covers: AC3
  - Done when: ...

## Wide refactors (expand - migrate - contract)
Only for one mechanical change whose blast radius spans the codebase (rename a column, retype a shared symbol). Do not force it into a vertical slice:
- [ ] Txx Expand: add the new form beside the old one; nothing breaks
- [ ] Txx Migrate batch (per package or directory), Blocked by: expand, one task per batch; CI stays green because the old form still exists
- [ ] Txx Contract: delete the old form, Blocked by: every migrate batch
