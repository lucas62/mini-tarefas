---
name: wf-plan
description: Turn an approved spec into a technical plan (plan.md) and an ordered, testable task list (tasks.md). Use after /wf-spec is approved and before any implementation.
argument-hint: "[spec folder, default: the active spec]"
---

# /wf-plan - decide HOW, then slice the work

Input: `$ARGUMENTS` (spec folder name). Default: the folder named in `docs/specs/.active`; if missing, the newest spec with `Status: approved`. If the spec is not approved, stop and say so.

## Steps
1. **Read** `spec.md`, `AGENTS.md`, `docs/GLOSSARY.md` (use its terms in the plan and task titles), `.claude/rules/*`, and the code areas the change will touch. For wide sweeps use the Explore subagent so raw search output stays out of this conversation.
2. **Write `plan.md`** from [plan-template.md](plan-template.md). It must contain: approach, at least one *rejected* alternative and why, the files/modules affected, data model / API contract changes, risks and rollback, and a **test strategy as an evidence path**: for each claim the change makes (every AC and every invariant that must keep holding), what evidence would establish or refute it, at which **seam** and with what method, and what that evidence cannot show. Keep the verification budget minimal: the smallest non-duplicative set of checks that covers every claim and boundary, each claim owned by one check. If the system makes a claim hard to observe or repeat (device-only behavior, third-party sandbox), propose the smallest *verification affordance* (a fixture, seed script, debug screen, test endpoint) and say whether it is temporary or durable. `/wf-build` and `/wf-tdd` treat these seams as agreed with the user, so name them concretely.
3. **Write `tasks.md`** from [tasks-template.md](tasks-template.md):
   - Slice as **vertical tracer bullets**: each task cuts a narrow but complete path through every layer it touches (schema, API, UI, tests), is demoable or verifiable on its own, and fits one fresh context window (about one commit). Never slice by layer ("all the models, then all the screens").
   - **Prefactor first**: if the code resists the change, the first task makes the change easy without changing behavior; then make the easy change.
   - Order by user-story priority so P1 alone is a shippable MVP, then by risk (spikes, integrations, migrations early).
   - Every task declares `Story`, `Blocked by` (the tasks that must finish first, or `none`), the ACs it `Covers`, and a concrete **Done when** check (a command or observable behavior). Only list blockers that truly gate it; mark `[P]` on tasks that can run in parallel once their blockers are done.
   - A **wide refactor** (one mechanical change whose blast radius spans the codebase) is the exception to vertical slicing: sequence it as expand - migrate batches - contract, as in the template.
4. **Consistency check (read-only analysis, before showing anything).** Inspired by the `analyze` step of GitHub's Spec Kit. Cross-check `spec.md`, `plan.md` and `tasks.md` and fix the artifacts until all hold: every AC is listed in at least one task's `Covers`; every task covers an AC or is explicitly a prefactor/infra task with a reason; every `Blocked by` names an existing task and there are no cycles; every plan decision that needs approval is reflected in the tasks that depend on it; terms match the glossary; nothing contradicts the *Boundaries* in `AGENTS.md`. Mention in the checkpoint what you corrected.
5. **Flag approvals needed**: new dependencies, migrations, contract changes, infra/CI changes. List them at the top of `plan.md` under *Needs approval*.
6. **Checkpoint.** Summarize plan and task count, list the approvals needed, and wait. Do NOT implement. After approval, set spec `Status: in-progress`.

If planning exposes a gap or contradiction in the spec, update the spec (and tell the user) rather than papering over it in the plan.
