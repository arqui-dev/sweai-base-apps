# 12. Glossary

| Term | Meaning here |
|------|--------------|
| arc42 | The documentation template these twelve sections follow |
| C4 | Context, Container, Component, Code. Four zoom levels for architecture diagrams |
| Entitlement | A row in `public.entitlements` granting premium access to an email |
| GROQ | Sanity's query language. Used instead of GraphQL because it can conditionally resolve a field |
| Lead | A row in `public.leads`, on either the `waitlist` or the `early-access` list |
| Magic link | A one-hour sign-in link. The only authentication method here |
| Portable Text | Sanity's block content format. Rendered by `@portabletext/react` |
| Premium post | A Sanity `post` with `isPremium` true. Body resolves only for an entitled reader |
| ponytail | The working style this repo follows. A `ponytail:` comment marks a deliberate shortcut and names its upgrade path |
| Result | `Ok<T>` or `Err<E>` from `src/shared/result.ts`. Recoverable failures are return values, not exceptions |
| RLS | Row level security. Postgres policies that decide which rows a role can see |
| Service role | The Supabase key that bypasses RLS. Used in two signature or token verified paths only |
| Theme | A block of CSS custom properties under one `[data-theme]` selector |
| Trust boundary | Any point where external input enters. Each one has a Zod schema |
