---
name: wf-domain
description: Build and sharpen the project's domain language - challenge fuzzy or conflicting terms, stress-test with concrete scenarios, check them against the code, and record resolved terms in docs/GLOSSARY.md (and rare, real decisions as ADRs). Use when discussing domain terminology, writing or editing the glossary, or recording an ADR.
---

# /wf-domain - one name per concept, written down the moment it is settled

Adapted from Matt Pocock's `domain-modeling` skill (MIT). See `THIRD_PARTY_NOTICES.md`.

Merely *reading* `docs/GLOSSARY.md` for vocabulary is a one-line habit any skill can do. This skill is for when you are **changing** the model.

## Files
- `docs/GLOSSARY.md` - the vocabulary. Create it lazily, when the first term is resolved.
- `docs/adr/NNNN-slug.md` - decisions (template: `docs/adr/0000-template.md`). Create lazily too.

## During the conversation
- **Challenge against the glossary.** When a term conflicts with the glossary, say so at once: "The glossary defines *cancellation* as X, but you seem to mean Y. Which is it?"
- **Sharpen fuzzy language.** For vague or overloaded words ("account", "user", "order"), propose a precise canonical term and ask which concept is meant.
- **Stress-test with scenarios.** Invent concrete edge cases that force the boundaries between concepts to be explicit (partial refund, joint account, offline submission, a patient with two providers).
- **Cross-reference the code.** When the user says how something works, check the code. If they disagree, surface it: "The code cancels whole Orders, but you said partial cancellation exists. Which is right?"
- **Update the glossary inline,** as each term is resolved, not in a batch at the end.

## Glossary format
```markdown
**Term** - one or two sentences saying what it IS in this domain.
_Avoid:_ synonyms and near-misses that must not be used for this concept.
```
The glossary contains definitions only: no implementation details, no decisions, no TODOs. It is not a spec or a scratch pad.

## ADRs, sparingly
Offer an ADR only when all three hold: (1) it is **hard to reverse**, (2) it would be **surprising without context** ("why did they do it this way?"), (3) it came from a **real trade-off** between genuine alternatives. If any is missing, do not write one.
