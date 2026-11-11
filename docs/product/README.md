# Product documents

What product documentation this repository keeps, what makes each document
valid, and the seam between product and architecture.

The repository is a base that products get started from, so it carries two
kinds of product document: the ones about the base itself, and the templates a
product started from it should fill in.

## The seam

The single most useful rule here, because without it both documents rot:

**A PRD says what changes and how anyone knows it worked. An ADR says how it
is built and what that costs.**

A PRD that names a library has made an architecture decision in the wrong
document, where nobody will look for it and nothing records what it cost. An
ADR that argues a feature is worth building has made a product decision with
no success measure attached.

| Question | Document |
|----------|----------|
| Why does this exist, for whom | Product brief |
| What changes, and how do we know it worked | PRD |
| How does it behave, including when it fails | Use case |
| Who is served, and what decision did that drive | Persona |
| How is it built, and what does that cost | ADR |
| In what order, and what blocks what | Roadmap |

## The document set

| Document | Scope | Status here |
|----------|-------|-------------|
| [Product brief](product-brief.md) | One per product. The base has one | Written |
| [PRD](prd-template.md) | One per feature worth a success measure | Template plus one worked example |
| [Roadmap](roadmap.md) | One per product, re-sequenced not rewritten | Written |
| [Personas](../personas.md) | One set per product | Written, 5 personas |
| [Use cases](../use-cases.md) | One per behavior, with its designed failure | Written, 13 cases |
| [ADRs](../adr/) | One per decision with a real alternative | Written, 8 records |

Deliberately absent: a backlog tool export, burndown charts, story points, and
a separate epic layer. For a base maintained by one person plus agents, the
roadmap plus the PRDs carry everything those would, and the absent ones carry
process overhead with no reader.

## What makes a PRD valid

A PRD that fails any of these is not ready for an agent or a person to build
from. The bar is deliberately the same shape as the ADR bar: a document that
cannot be acted on without asking the author a question is not finished.

| # | Requirement | Why it is on the list |
|---|-------------|-----------------------|
| 1 | The problem names who has it, with evidence | Without a named holder, the feature serves a guess. Evidence can be a persona, an incident, a measurement, or a sentence from a real conversation |
| 2 | Success is measurable, and the measurement already exists or is part of the work | "Improves conversion" is not a success measure. "Guest checkouts that later sign in, counted from the entitlements table" is |
| 3 | Non-goals and anti-goals are listed | A non-goal is out of scope. An anti-goal would make the feature a failure even if it shipped and worked. The second one is the one people skip |
| 4 | It makes no architecture decision | No library, no schema, no vendor. If the product need constrains the architecture, say the constraint, not the solution |
| 5 | Acceptance criteria are runnable | A reviewer or an agent can execute each one and get a yes or no. "Works correctly" is not runnable |
| 6 | It names the condition that kills the feature | What would have to be true for this to be removed. A feature with no kill condition is permanent by default, which is how products accumulate |
| 7 | It names what it is blocked on, and by whom | A PRD that cannot start is a plan, and saying so is more useful than a status meeting |

## What makes a roadmap valid

| # | Requirement |
|---|-------------|
| 1 | Every item names what blocks it, or says nothing does |
| 2 | Items are ordered by what unblocks the most, not by appeal |
| 3 | A blocked item names the person or decision that unblocks it |
| 4 | Nothing has a date unless something external fixes that date |
| 5 | Items leave the roadmap when they ship or die. A roadmap that only grows is a wish list |

Dates are the usual failure. For work with no external deadline, a sequence is
honest and a date is a guess that gets quoted back.

## Review discipline

Product documents get the same treatment as the code they describe.

- A PRD is reviewed against the seven points above before work starts, not
  after.
- Shipping a feature updates its PRD's acceptance criteria to say which were
  met, and the roadmap to remove the item.
- A PRD whose success measure came back negative is closed with that result
  recorded. That record is the most valuable document in the set and the one
  most often skipped.
