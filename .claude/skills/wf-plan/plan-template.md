# Plan - NNN Title

Spec: ./spec.md

## Needs approval
- [ ] New dependencies: ...
- [ ] Migrations / data changes: ...
- [ ] Public API / contract changes: ...
- [ ] CI/CD / build config: ...

## Approach
How it will work, in plain language, with the key design decisions.

## Alternatives considered
- **Chosen:** ... because ...
- **Rejected:** ... because ...

## Affected code
| Area / file | Change |
| --- | --- |
| `src/...` | ... |

## Data model & contracts
Schemas, endpoints, events, types - before/after.

## Test strategy (evidence path)
For each claim: what would prove or refute it, where we observe it, and what that evidence cannot show. One owner per claim; the smallest set of checks that covers every claim and boundary.

| Claim (AC or invariant) | Evidence | Seam / method | Limits (what it can't show) |
| --- | --- | --- | --- |
| AC1 ... | failing-then-passing test asserting ... | hook `useX` with a fake repository | does not exercise the real SDK |
| Invariant: existing flow Y still works | existing suite `<command>` | unchanged | - |

Verification affordance needed? (fixture, seed script, debug screen, test endpoint) - temporary or durable:

## Risks, rollout & rollback
- Risk: ... Mitigation: ...
- Rollout: flag / staged / OTA vs store release
- Rollback: ...

## Deviations (filled during /wf-build)
- (none yet)
