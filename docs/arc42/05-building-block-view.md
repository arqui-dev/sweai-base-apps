# 5. Building block view

## C4 level 2: containers

```mermaid
C4Container
  title Containers: Hire Service

  Person(reader, "Reader")
  Person(editor, "Editor")
  Person(engineer, "Engineer")

  System_Boundary(vercel, "Vercel project sweai-base-apps") {
    Container(web, "Site", "Next.js App Router, React Server Components", "Landing, blog, paywall, profile, capture forms, cart")
    Container(api, "Route handlers", "Next.js, Node 22", "Newsletter, leads, checkout, Stripe webhook, campaign send, auth callback")
    Container(mw, "Proxy", "Next.js proxy (src/proxy.ts)", "Refreshes the Supabase session cookie, redirects anonymous users off /profile")
  }

  System_Boundary(sbvercel, "Vercel project sweai-storybook") {
    Container(sb, "Storybook catalogue", "Static build of src/**/*.stories.tsx", "Every component in every theme. No env vars, no story imports env.ts")
  }

  System_Boundary(supa, "Supabase project") {
    ContainerDb(pg, "Postgres", "Postgres 15 with RLS", "profiles, newsletter_subscribers, leads, entitlements")
    Container(auth, "Auth", "GoTrue", "Magic-link sign in, session cookies")
  }

  System_Ext(stripe, "Stripe Checkout")
  System_Ext(sanityapi, "Sanity content API")
  System_Ext(studio, "Sanity-hosted Studio")
  System_Ext(resend, "Resend")

  Rel(reader, web, "HTTPS")
  Rel(editor, studio, "HTTPS, separate domain")
  Rel(engineer, sb, "HTTPS, separate Vercel project")
  Rel(web, api, "fetch from client components")
  Rel(mw, auth, "Refresh session")
  Rel(web, auth, "getUser()")
  Rel(web, pg, "Entitlement and subscription reads, under RLS")
  Rel(web, sanityapi, "GROQ, 60s revalidate")
  Rel(api, pg, "Service-role writes")
  Rel(api, stripe, "Create Checkout session")
  Rel(stripe, api, "Signed webhook")
  Rel(api, resend, "Send mail")
  Rel(studio, sanityapi, "Read and write content")
```

## C4 level 3: components inside the application

```mermaid
C4Component
  title Components: features and their collaborators

  Container_Boundary(app, "Next.js application") {
    Component(pages, "Pages", "Server Components", "src/app/(site)/**")
    Component(handlers, "Route handlers", "src/app/api/**", "HTTP boundary: rate limit, parse, delegate")
    Component(http, "shared/http", "parseBody + json", "Zod at the boundary, typed failures")
    Component(ratelimit, "lib/rate-limit", "Fixed window per instance", "Public form abuse brake")

    Component(posts, "features/posts", "queries + gate + types", "GROQ, isLocked, assertNoLeak")
    Component(payments, "features/payments", "checkout + webhook + entitlements", "Price from server config, signature first, idempotent grant")
    Component(newsletter, "features/newsletter", "schema + service", "Idempotent subscribe, batched campaign")
    Component(leads, "features/leads", "schema + service", "One table, list name as data")

    Component(libs, "lib/*", "supabase, stripe, sanity, resend, money", "Clients only, no rules")
    Component(env, "env + env.public", "Zod-validated config", "The only reader of process.env")
    Component(theme, "components/theme", "themes.ts + switcher", "data-theme attribute and a cookie")
    Component(nav, "components/nav + site-menu", "nav-links.ts", "Header links and the hamburger panel, from one href list")
  }

  Rel(pages, posts, "listPosts, getPost")
  Rel(pages, payments, "hasPremium")
  Rel(handlers, http, "parseBody")
  Rel(handlers, ratelimit, "allow")
  Rel(handlers, payments, "createCheckoutSession, handleStripeWebhook")
  Rel(handlers, newsletter, "subscribe, sendCampaign")
  Rel(handlers, leads, "captureLead")
  Rel(posts, libs, "sanityClient")
  Rel(payments, libs, "stripe, supabaseAdmin")
  Rel(newsletter, libs, "resend, supabaseAdmin")
  Rel(leads, libs, "resend, supabaseAdmin")
  Rel(libs, env, "reads validated config")
  Rel(pages, theme, "active theme from cookie")
  Rel(pages, nav, "header and hamburger panel")
```

## Navigation

`src/components/nav-links.ts` holds every navigable page. `PRIMARY_LINKS` is
the subset shown inline in the header above the `sm` breakpoint; `NAV_GROUPS`
is the full list, grouped Read, Support and Join, rendered by
`src/components/site-menu.tsx` at every screen size. Both arrays carry
`as const`, so `typedRoutes` checks each `href` against the generated route
union and a renamed page fails the typecheck instead of shipping a dead link.

`/success`, `/unsubscribe`, `/auth/*` and `/api/*` are absent on purpose:
arriving at one by clicking makes no sense.

`site-menu.tsx` uses the Popover API, so it holds no state and is not a client
component. The browser supplies light dismiss, top-layer stacking and
`aria-expanded` on the invoker. Section 11 records the ceiling.

## Component catalogue

Every component has a story under `src/**/*.stories.tsx`, and the stories are
not decorative. The `storybook` project in `vitest.config.mts` runs each one as
a Chromium browser test under `npm run test`, with `@storybook/addon-a11y` set
to `error`. A component that stops rendering, or grows an accessibility
violation, fails the build. `.storybook/preview.tsx` puts `data-theme` on the
story wrapper, so the toolbar re-skins every story without touching a prop. The
catalogue itself deploys as the second Vercel project in section 7.

## Responsibilities

| Building block | Owns | Must not |
|----------------|------|----------|
| `src/app/(site)/**` | Layout, copy, which component renders, plus `not-found`, `error` and `loading` | Call Stripe, Supabase or Sanity directly |
| `src/app/robots.ts`, `src/app/sitemap.ts` | What crawlers may index | Fail the response when Sanity is down |
| `src/app/api/**` | Rate limiting, parsing, status codes | Hold business rules |
| `src/features/posts` | The read rule for premium content | Know about HTTP |
| `src/features/payments` | Price, grant, idempotency, signature check | Trust any number from a request |
| `src/features/newsletter` | Subscribe idempotency, batch size | Fail a subscribe because mail failed |
| `src/features/leads` | List membership and position | Need a migration for a new list |
| `src/components/**` | Markup and theme tokens, one story per component | Hold a colour literal or a per-theme branch |
| `src/components/nav-links.ts` | The only list of navigable hrefs | Carry a route that is not a page |
| `src/lib/**` | One configured client each | Contain an `if` about business state |
| `src/env.ts` | Reading `process.env` | Be imported by a client component |
| `src/shared/**` | `Result`, logging, body parsing | Import from `features` |
