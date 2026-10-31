---
name: wf-tdd
description: Test-driven development rules - agree the test seams first, then one failing test, minimal code, repeat in vertical slices. Use when building a feature or fixing a bug test-first, when /wf-build implements a task, or when asked for red-green-refactor or "write the tests first".
---

# /wf-tdd - tests worth keeping

Adapted from Matt Pocock's `tdd` skill (MIT). See `THIRD_PARTY_NOTICES.md`.

## What a good test is
It verifies behavior through a public interface, never implementation details. It reads like a specification ("user can check out with a valid cart") and survives refactors because it does not care about internal structure.

## Seams: where tests go
A **seam** is the public boundary where behavior is observable without reaching inside. Tests live at seams, never against internals.

1. **Agree the seams before writing any test.** In `/wf-build`, the *Test strategy* table in `plan.md` is the agreement. If it is missing or does not cover this task, propose seams and confirm with the user. Give each seam one line: what it catches, what it misses.
2. Prefer existing seams over new ones, the highest seam that reaches the behavior, and as few as possible.
3. Seams by stack (adjust to the project's own structure):
   - **React Native:** a hook or use-case with its repository injected (call it directly or via `renderHook`); a screen flow through React Native Testing Library only for user-visible journeys. Not: child component props, internal state, snapshot of the whole tree.
   - **Node API:** the HTTP endpoint (supertest or equivalent), or a service with a fake repository; a real test database for critical flows.
   - **Next.js:** route handler / server action; components by what the user sees and does.

## The loop (vertical slices)
1. **Red:** write ONE failing test for the next behavior at an agreed seam. Run it and watch it fail for the right reason.
2. **Green:** write the minimum code that passes. No speculative features.
3. Repeat, one slice at a time. Each test answers what the previous cycle taught you.
4. **Refactor only when green**, in a separate commit, never while red.

Writing all tests first and all code after ("horizontal slicing") is the main failure: the tests verify imagined behavior and go insensitive to real change.

## Anti-patterns
- **Implementation-coupled:** mocks internal collaborators, tests private methods, or checks results through a side channel (querying the database instead of the interface). The tell: it breaks on a refactor that did not change behavior.
- **Tautological:** the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`), so it can never disagree with the code. Expected values come from an independent source: a literal, a worked example, the spec.
- **Vague name or multi-purpose test:** one logical assertion per test, named by behavior.

## Mocking
Mock only at **system boundaries**: network and third-party APIs, the database (prefer a test DB), time, randomness, the file system, and on mobile native modules (permissions, secure storage, push, camera). Do not mock your own modules. Design for it with dependency injection: pass the client in instead of constructing it inside.

## When a test is not practical
Pure layout, copy or config changes: say so explicitly and define a concrete manual check (device, screen, steps) instead of skipping silently.
