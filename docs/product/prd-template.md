# PRD-NNN: [what changes, as a noun phrase]

**Date:** YYYY-MM-DD
**Status:** Draft | Ready | Building | Shipped | Closed unmet | Killed
**Blocked on:** nothing, or the named person or decision
**Related:** the ADR that implements it, and the use case it changes

Numbers are assigned at review, not while drafting.

---

## Problem

One paragraph. Who has this problem and the evidence that they do. Reference a
persona, an incident, a measurement, or a real sentence someone said. State the
problem, do not hedge it.

## Why now

What changed to make this worth doing before the other things on the roadmap.
"It was always a good idea" means it is not this one.

## Success

| Measure | Today | Target | Where it is read |
|---------|-------|--------|------------------|
| | | | |

If the measurement does not exist yet, building it is part of this PRD and
belongs in the acceptance criteria.

## Non-goals

What is out of scope, so a reviewer does not ask for it.

## Anti-goals

What would make this a failure even if it shipped and worked. Harder to write
than non-goals and worth more.

## Behavior

What a person experiences, in their words, not the system's. No library names,
no schema, no vendor. If a product need constrains the architecture, state the
constraint and let the ADR choose: "access must survive the buyer signing up
days later" rather than "key the row by email".

## Acceptance criteria

Runnable. A reviewer or an agent executes each one and gets a yes or no.

| # | Criterion | How it is checked |
|---|-----------|-------------------|
| 1 | | |

## Kill condition

What would have to be true for this to be removed. A feature with no kill
condition is permanent by default.

## Open questions

Only the ones that change what gets built. Each names who answers it.
