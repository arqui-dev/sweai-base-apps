# 4. Solution strategy

Five decisions shaped everything else. Each has an ADR in section 9.

| Decision | Choice | Consequence that mattered |
|----------|--------|---------------------------|
| Backend shape | Next.js route handlers, no separate NestJS service | One deploy, one language, one env file. The whole backend is six route handlers |
| Authorization | Supabase row level security | Access rules live in `supabase/schema.sql`, not in page code. A forgotten `if` in a component cannot leak a row |
| Paywall placement | The GROQ query resolves the body only when entitled | The premium text never reaches the Node process for a locked post, so no rendering mistake can leak it |
| Entitlement key | Email, with an optional user id | A guest who pays and signs up later keeps access with no reconciliation job |
| Theming | CSS custom properties switched by one attribute | Five looks, zero component branches, and a theme switch costs no re-render |

## How the laziness was spent

The base deliberately does not have: a state management library, a component
library, a form library, an ORM, a service layer in front of Supabase, a DTO
mapping layer, a cart store, or a custom logger. Each was considered and each
lost to something already present: React state, Tailwind, native form
validation, the Supabase client, `Result<T, E>`, and `console` plus Vercel's log
drain.

What it does have, because the alternative was worse: Zod at every trust
boundary, a `Result` type instead of thrown errors in services, a rate limiter
on the public forms, and constant-time comparison on the admin token.

## Layering

```
app/        route handlers and pages, HTTP and JSX only
features/   the rules: schemas, services, the paywall gate
lib/        one file per external client, no logic
shared/     Result, logger, body parsing
```

A page never calls Stripe or Supabase directly except through `lib`, and a
`lib` file never decides anything. `features/` is where behavior lives, and it
is the only layer with tests.
