@AGENTS.md

## Claude Code
- Use plan mode for changes touching auth, payments, migrations or infra.
- Guardrails are enforced by hooks in `.claude/hooks/` (knobs: `.claude/workflow.json`). Do not work around them; ask the user instead.
- Personal, uncommitted notes go in `CLAUDE.local.md`.
