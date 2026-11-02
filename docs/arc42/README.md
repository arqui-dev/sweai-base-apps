# Architecture documentation

arc42 template, one file per section. Diagrams are Mermaid, rendered inline by
GitHub and by the Mermaid plugin in most IDEs. Nothing here is generated, and
nothing here is decorative: a section that had nothing to say was cut to a
single line rather than padded.

| Section | File | Answers |
|---------|------|---------|
| 1 | [01-introduction-and-goals.md](01-introduction-and-goals.md) | What this is for and who it serves |
| 2 | [02-constraints.md](02-constraints.md) | What was fixed before design started |
| 3 | [03-context-and-scope.md](03-context-and-scope.md) | System context, C4 level 1 |
| 4 | [04-solution-strategy.md](04-solution-strategy.md) | The five decisions that shaped everything else |
| 5 | [05-building-block-view.md](05-building-block-view.md) | Containers and components, C4 levels 2 and 3 |
| 6 | [06-runtime-view.md](06-runtime-view.md) | Sequence diagrams for the four flows that matter |
| 7 | [07-deployment-view.md](07-deployment-view.md) | Vercel, Supabase, Sanity, Stripe, Resend |
| 8 | [08-crosscutting-concepts.md](08-crosscutting-concepts.md) | Auth, theming, validation, errors, logging |
| 9 | [09-architecture-decisions.md](09-architecture-decisions.md) | ADR index |
| 10 | [10-quality-requirements.md](10-quality-requirements.md) | Quality tree and scenarios |
| 11 | [11-risks-and-technical-debt.md](11-risks-and-technical-debt.md) | Known gaps, with the trigger to fix each |
| 12 | [12-glossary.md](12-glossary.md) | Terms |

Related: [personas](../personas.md), [use cases](../use-cases.md),
[agents](../../.claude/agents).
