---
name: wf-fix
description: Diagnose and fix a bug - build a deterministic, red-capable feedback loop first, then minimise, hypothesise, instrument, fix with a regression test, and clean up. Use when something is broken, throwing, failing, flaky, crashing or slow, or when the user says "debug", "diagnose" or "fix this bug".
argument-hint: "[symptom, error message, ticket or Sentry link]"
---

# /wf-fix - find the cause with evidence, not theories

Adapted from Matt Pocock's `diagnosing-bugs` skill (MIT). See `THIRD_PARTY_NOTICES.md`.

Symptom: `$ARGUMENTS` (if empty, ask what is observed vs expected).
Skip a phase only with an explicit justification. A trivial typo-level bug can go straight to Phase 5.

## Redact first
Everything you show (commands, logs, captured payloads) must have secrets, tokens and personal data replaced with `<REDACTED>`. Build loops against environment variables so credentials stay out of what you print. If redaction makes the output useless, say so and ask the user.

## Phase 1 - Build a feedback loop (this is the skill)
A tight pass/fail signal that goes red on THIS bug is what finds the cause; everything after consumes it. Spend disproportionate effort here. Options, roughly in order:
1. A failing test at whatever seam reaches the bug (see `/wf-tdd`).
2. A curl / HTTP script against a running dev server.
3. A CLI or script run with a fixture input, diffed against a known-good output.
4. A UI driver: Maestro / Detox flow on a simulator for mobile, Playwright for web.
5. **Replay a captured trace:** a real request, payload, or Sentry event saved to disk and replayed through the code path in isolation.
6. A throwaway harness exercising the buggy path with one call.
7. A property / fuzz loop for "sometimes wrong output".
8. A bisection harness (`git bisect run`) when it appeared between two known states.
9. A differential loop: same input through old vs new version or two configs.
10. Last resort, a human in the loop: give the user exact steps and a structured way to report back.

Then **tighten** it: faster, sharper (assert the specific symptom, not "didn't crash"), more deterministic (pin time, seed randomness, freeze the network). For non-deterministic bugs, raise the reproduction rate (loop 100x, add stress, narrow timing windows) until it is debuggable.

**Phase 1 is done only when** you can name ONE command you have already run (show it, redacted) that is: red-capable (asserts the user's exact symptom), deterministic, fast (seconds), and runnable unattended.
If you cannot build a loop, stop and say so: list what you tried and ask for (a) access to an environment that reproduces it, (b) a redacted captured artifact, or (c) permission to add temporary instrumentation. Do not theorise without a loop.

## Phase 2 - Reproduce and minimise
Run the loop and watch it go red with the failure the **user** described (not a nearby one). Then cut inputs, callers, config, data and steps one at a time, re-running after each cut, until every remaining element is load-bearing.

## Phase 3 - Hypothesise
Write 3-5 ranked, **falsifiable** hypotheses before testing any: "If X is the cause, then changing Y makes the bug disappear." A hypothesis with no prediction is a vibe; sharpen or drop it. Show the ranked list to the user before testing (they often know "we just changed #3"); do not block if they are away.

## Phase 4 - Instrument
Each probe maps to one prediction; change one variable at a time. Prefer a debugger over ten logs, targeted logs at boundaries over "log everything". Tag every debug log with a unique prefix such as `[DEBUG-a4f2]` so cleanup is one grep. For performance bugs, measure a baseline first, then bisect.

## Phase 5 - Fix with a regression test
Write the regression test BEFORE the fix, but only at a **correct seam**: one that exercises the real bug pattern as it occurs at the call site. If the only reachable seam is too shallow, a test there gives false confidence; record that "no correct seam exists" as a finding (the architecture is preventing the bug from being locked down). With a seam: turn the minimised repro into a failing test, watch it fail, apply the fix, watch it pass, then re-run the Phase 1 loop on the original scenario.

## Phase 6 - Cleanup and learn
- [ ] Original repro no longer reproduces
- [ ] Regression test passes (or the missing seam is documented)
- [ ] All debug logs removed (`grep` the prefix); throwaway harnesses deleted
- [ ] The confirmed hypothesis is stated in the commit message
Then ask whether the bug reveals a missing guardrail and, if so, suggest `/wf-learn`.
