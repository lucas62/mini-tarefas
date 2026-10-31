# NNN - Title

Status: draft | approved | in-progress | shipped
Date: YYYY-MM-DD

## Assumptions (written first)
| # | Assumption | Source (said by user / read in <file> / guess) | Status (confirmed / rejected / open) |
| --- | --- | --- | --- |
| A1 | ... | guess | open |

## Problem
Who has it, what hurts, evidence. 2-4 lines.

## Goal
The observable outcome, in one sentence, and how we will know (metric or behavior).

## Non-goals
- What this deliberately does NOT do.

## User stories (prioritized, each independently testable)
Order by importance. Each story must be a standalone slice: if only that one ships, it still delivers value and can be tested and demoed on its own. P1 is the MVP.
Number acceptance criteria globally (AC1, AC2, ...) so plan, tasks and review can refer to them.

### US1 (P1) - Short title
As a <role>, I want <capability>, so that <benefit>.
- **Why this priority:** ...
- **Independent test:** how to verify this story alone.
- **AC1** - Given <state>, when <action>, then <observable result>.
- **AC2** - ...

### US2 (P2) - Short title
...

## Edge cases & failure modes
- Empty / first-run state
- Slow or offline network, timeouts, retries
- Permission denied / unauthenticated / expired session
- Invalid or hostile input
- Concurrency / double-submit
- (Mobile) app backgrounded or killed mid-flow; small screens; accessibility

## Interfaces (what, not how)
User-visible screens and flows, API surface, events. No implementation choices.

## Open questions
- [ ] Q1 ...

## Risks
- Risk: ...
