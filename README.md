# Hire Service

A study base for building production web applications. One Next.js app on
Vercel, wired to four managed services, documented well enough to copy.

The demonstration product is a consulting landing page: free and premium posts,
a paywall that costs one coffee, a newsletter, and two lead lists. That set was
chosen because it exercises every integration at least once.

```
Next.js 16 (App Router, React 19, TypeScript strict, Tailwind v4)
  Supabase   auth (magic link) + Postgres with row level security
  Stripe     hosted Checkout, one-off payment, signed webhook
  Sanity     headless CMS, Studio hosted by Sanity (npx sanity deploy)
  Resend     welcome, confirmation and campaign email
  Vercel     preview per pull request, production on main
```

## Pages

| Route | What it does |
|-------|--------------|
| `/` | Landing page: services, latest posts, coffee button, newsletter, theme gallery |
| `/blog` | Post list, free and premium marked |
| `/blog/[slug]` | Post, or a paywall if premium and unpaid |
| `/subscribe` | Newsletter signup |
| `/waitlist` | Lead capture, `waitlist` list |
| `/early-access` | Lead capture, `early-access` list |
| `/coffee` | Standalone single-payment page: what it unlocks, one button |
| `/cart` | Single-line-item cart with a quantity stepper |
| `/themes` | Design gallery: all five rendered live, pick one to apply |
| `/login` | Magic-link sign in, no passwords |
| `/profile` | Email, premium state, newsletter state, sign out |
| `/unsubscribe` | Signed one-click unsubscribe, reached from a mail footer |
| `/success` | Post-payment landing |

Plus `not-found` and an error boundary for the site shell, `robots.txt`, and a
`sitemap.xml` built from the published posts. The Studio is not a route here:
it is hosted by Sanity, and the footer links to it when
`NEXT_PUBLIC_SANITY_STUDIO_URL` is set.

## API

| Route | Auth | Validated by |
|-------|------|--------------|
| `POST /api/newsletter` | Public, 5 req/min/IP | `subscribeInput` |
| `POST /api/leads` | Public, 5 req/min/IP | `leadInput` |
| `POST /api/checkout` | Public, 10 req/min/IP | `checkoutInput` |
| `POST /api/stripe/webhook` | Stripe signature | `stripe.webhooks.constructEvent` |
| `POST /api/newsletter/unsubscribe` | HMAC signature over the address | query `e` and `t` |
| `POST /api/newsletter/send` | Bearer `ADMIN_API_TOKEN`, constant-time compare | `campaignInput` |
| `GET /auth/callback` | Supabase code | Same-origin `next` only |

## Themes

Five presets: `minimalist`, `modern`, `brutalist`, `editorial`, `terminal`.
Compare them at `/themes` or switch with the
control in the header. Each one is a block of fifteen CSS custom properties in
`src/app/themes.css`, so no component knows which is active, and adding a sixth
is one CSS block plus one array entry.

The gallery renders all five at once because the theme selectors are
`[data-theme="..."]` and not `html[data-theme="..."]`, so the attribute on a
preview wrapper restyles its own subtree. No iframes, no duplicated components.

## Getting started

```bash
cp .env.example .env.local     # fill in the four service blocks
npm install
npm run dev
```

The repository ships a `.env.local` with placeholders so `npm run build` works
before any account exists. Replace them with real values before using a
feature. Until you do, every write endpoint answers 503 with a `hint` naming
the variables still unset, so a half-finished setup diagnoses itself:

```json
{ "message": "Could not save your address.",
  "hint": "Setup incomplete. Still placeholders in .env.local: SUPABASE_SECRET_KEY, ..." }
```

Then:

1. Paste `supabase/schema.sql` into the Supabase SQL editor. It creates four
   tables and enables row level security on all of them.
2. Add `http://localhost:3000/auth/callback` to the Supabase allowed redirect
   URLs.
3. Publish the Studio and create a post. The schema lives in `sanity/schema/`,
   so deploying it is one command:
   ```bash
   npx sanity deploy          # prints the hosted Studio URL
   ```
   Put that URL in `NEXT_PUBLIC_SANITY_STUDIO_URL`, then create a post and
   toggle **Premium** to see the paywall. Re-run `sanity deploy` after any
   schema change.
4. Forward the Stripe webhook locally:
   `stripe listen --forward-to localhost:3000/api/stripe/webhook`

Full deployment steps, including the Vercel and Stripe dashboard settings, are
in [docs/arc42/07-deployment-view.md](docs/arc42/07-deployment-view.md).

## Scripts

```bash
npm run dev           # Next dev server
npm run verify        # typecheck + lint + test
npm run build         # production build
npm run test:watch    # vitest in watch mode
npm run audit:runtime # gated: any advisory in the runtime tree fails
npm run audit:all     # reported: build-time tooling, not gated
npm run scan:secrets  # gitleaks over full history (needs the gitleaks binary)
```

CI runs `verify` plus `build` with placeholder credentials, and a pinned
gitleaks CLI over the full history. The build never needs a real key.
Placeholders are allowlisted in `.gitleaks.toml` by value rather than by path,
so a real credential in one of those same files still fails the scan. Reviewed
historical findings live in `.gitleaksignore`, keyed by exact
`commit:file:rule:line` fingerprint, so the same pattern anywhere else still
fails.

## Layout

```
src/
  app/
    (site)/            pages, wrapped in the nav and footer shell
    api/               route handlers: HTTP concerns only
    auth/              magic-link callback and sign out
    globals.css        Tailwind tokens mapped from theme variables
    themes.css         the five theme blocks
    robots.ts          disallows the editor, personal and write routes
    sitemap.ts         static paths plus every published post
  features/            the rules: schemas, services, the paywall gate
  lib/                 one configured client per external service
  shared/              Result, logger, request body parsing, setup diagnostics
  components/          presentation, no business logic
  env.ts               the only reader of secret env vars
  proxy.ts             session refresh, protected-route redirect (was middleware.ts)
supabase/schema.sql    four tables, five policies, one trigger
sanity/schema/         the post document type, deployed with `npx sanity deploy`
docs/arc42/            architecture, twelve sections, Mermaid C4
docs/adr/              seven decision records
docs/personas.md       five personas and the decisions made for them
docs/use-cases.md      thirteen use cases with their designed failure
.claude/agents/        six project agents
```

## Documentation

- [Architecture (arc42)](docs/arc42/README.md), with C4 context, container and
  component diagrams plus four runtime sequences
- [Decision records](docs/arc42/09-architecture-decisions.md)
- [Personas](docs/personas.md) and [use cases](docs/use-cases.md)
- [Dependency and vulnerability policy](docs/adr/ADR-007-dependency-and-vulnerability-policy.md),
  and the [dependency register](docs/dependencies.md) justifying every library
- [AI roadmap](docs/ai-roadmap.md), the agents and checks still to build
- [Stripe integration review](docs/stripe-integration-review.md), eight findings
  and what Invoicing still needs
- [Rules for AI agents](CLAUDE.md)

## Dependencies

`npm audit --omit=dev` reports zero vulnerabilities, and CI fails on any
advisory at all in the runtime tree: `--audit-level=info`, no triage step
([ADR-007](docs/adr/ADR-007-dependency-and-vulnerability-policy.md)). Every
library is justified in [the register](docs/dependencies.md). Keeping the tree
clean is why the Studio is hosted rather than embedded: `next-sanity` depends on the
`sanity` editor package in production, which pulls the Sanity CLI and a Vite
plugin tree with 21 findings, 3 of them high. None was reachable from a
request, but an audit that always reports high findings is an audit nobody
reads. See [ADR-006](docs/adr/ADR-006-hosted-sanity-studio.md).

## What this is not

Not a product, and not a template to deploy unchanged. There are no recurring
subscriptions, refunds, invoices, team accounts, comments, search or i18n.
Deliberate gaps and the trigger for closing each are listed in
[section 11](docs/arc42/11-risks-and-technical-debt.md).
