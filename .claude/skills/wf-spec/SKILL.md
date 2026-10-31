---
name: wf-spec
description: Write a feature or bug spec (problem, goal, acceptance criteria, edge cases) in docs/specs/NNN-slug/spec.md before any code. Use when starting a feature, a non-trivial bug fix, or when asked for a spec/PRD; skip for one-line fixes.
argument-hint: "[feature idea, bug report or issue link]"
---

# /wf-spec - define WHAT and WHY (never HOW)

Input: `$ARGUMENTS`. If empty, ask what we are building.

## Steps
1. **Ground yourself.** Read `AGENTS.md` and `docs/GLOSSARY.md` (if present): use its vocabulary, and when the user's words conflict with it, say so. List existing specs (`docs/specs/`, or `specsDir` in `.claude/workflow.json`). If the idea overlaps an existing spec, say so and propose extending it instead of creating a new one.
2. **Assumptions first.** Before asking anything, write a numbered list of the assumptions you are making (A1...An: scope, user, platform, constraints, what "done" means), each with its source (`said by user`, `read in <file>`, or `guess`). Show it to the user. The interview below exists to confirm or kill the `guess` ones; never ask a question whose answer you already listed as read in a file.
3. **Clarify in rounds** (interview style adapted from Matt Pocock's `grilling`, MIT; see `THIRD_PARTY_NOTICES.md`). Treat the open decisions as a tree: the **frontier** is every decision whose prerequisites are already settled. Ask the whole frontier in one round, numbered, each question with your **recommended answer** worded so that "yes" accepts it. Wait for the answers, then recompute the frontier for the next round (answers unblock dependent questions).
   - Facts you can find yourself (in the code, docs, tickets) are your job, never the user's. Look them up.
   - Only ask what changes the design (scope, who the user is, hard constraints). Stop after 3 rounds or when the frontier is empty; whatever is left goes to *Open questions*, not silent assumptions.
   - If the input is already specific, skip the interview: the assumption list is the checkpoint.
4. **Create the folder.** Number = highest existing `NNN-*` + 1, zero-padded to 3 digits. Path: `docs/specs/NNN-<kebab-slug>/spec.md`. Write the folder name (one line) to `docs/specs/.active`.
5. **Fill the spec** from [spec-template.md](spec-template.md). Rules:
   - Organize the spec as **prioritized user stories (P1, P2, ...), each independently testable**: if only that story ships it still delivers value. P1 is the MVP.
   - Acceptance criteria sit under their story, must be testable by someone who has not read this conversation, and are numbered globally AC1...ACn (plan, tasks and review cite them). Prefer Given/When/Then.
   - No implementation choices (libraries, schemas, file names): that is `/wf-plan`.
   - Non-goals are explicit. Unknowns go to *Open questions*, never silently assumed.
   - The *Assumptions* section (near the top) keeps the A1...An list with each one's status: `confirmed`, `rejected` (and what replaced it) or `open`. An `open` one also appears in *Open questions*.
   - Cover edge cases: empty state, slow/offline network, permission denied, invalid input, concurrency; for mobile also backgrounding/interruption and small screens.
6. **Checkpoint.** Show a 5-line summary, the assumptions still `open`, and open questions, and ask for approval or edits. Do NOT start planning or coding. After approval set `Status: approved`.
