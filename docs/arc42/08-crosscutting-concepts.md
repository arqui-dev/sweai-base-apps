# 8. Cross-cutting concepts

## 8.1 Authentication

Magic link only. No passwords exist in this system, so there is nothing to
hash, rotate, reset, or leak.

| Place | What it does |
|-------|--------------|
| `LoginForm` | Calls `signInWithOtp` with a same-origin `emailRedirectTo` |
| `GET /auth/callback` | Exchanges the code for a session cookie, rejects a non-path `next` |
| `src/proxy.ts` | Refreshes the session cookie, because Server Components cannot write cookies |
| `getCurrentUser()` | Reads the user for a request, returns `null` on any error |

## 8.2 Authorization

Row level security is the authorization layer. Application code decides what to
render; Postgres decides what rows exist.

| Table | Who can read | Who can write |
|-------|--------------|---------------|
| `profiles` | The owner, by `auth.uid()` | The owner |
| `newsletter_subscribers` | The owner, by `auth.email()` | Service role only |
| `leads` | Nobody through the API | Service role only |
| `entitlements` | The owner, by `auth.uid()` or `auth.email()` | Service role only |

The service-role key appears in exactly two call paths: the Stripe webhook,
which has already verified a signature, and the campaign sender, which has
already checked an admin token in constant time.

## 8.3 The paywall

Three layers, in the order they run:

1. `posts.queries.getPost` passes `$entitled` to GROQ. Sanity resolves `body`
   only when the post is free or the flag is true. A locked body never reaches
   Node.
2. `isLocked` in `posts.gate.ts` is the single expression of the rule. The page
   and the test both call it, so they cannot drift.
3. `assertNoLeak` throws if a locked post somehow carries a body. It has never
   fired, and that is the point: it turns a silent leak into a 500.

## 8.4 Validation

Nothing untrusted reaches a service without passing a Zod schema first.

| Boundary | Schema |
|----------|--------|
| Server env | `serverSchema` in `src/env.ts`, throws at import |
| Browser env | `publicSchema` in `src/env.public.ts` |
| `POST /api/newsletter` | `subscribeInput`, trims and lowercases the email |
| `POST /api/leads` | `leadInput`, `list` restricted to a two-value enum |
| `POST /api/checkout` | `checkoutInput`, quantity 1 to 20, slug restricted to `[a-z0-9-]` |
| `POST /api/newsletter/unsubscribe` | `e` as an email, `t` as a 16 to 128 character token, both from the query string |
| `POST /api/newsletter/send` | `campaignInput`, `limit` capped at 500 |
| Stripe webhook | `stripe.webhooks.constructEvent`, which is the validation |

Unknown keys are stripped rather than rejected, so a client sending
`{"quantity":2,"unitAmount":1}` gets charged for two coffees at the server's
price.

## 8.5 Error handling

Recoverable failures are return values. `Result<T, E>` lives in
`src/shared/result.ts`, and services return `err("STORAGE_ERROR")` rather than
throwing. Route handlers map the error union to a status code, which is the only
place HTTP semantics appear.

Every `catch` either returns `err(...)`, logs, or rethrows. The two
deliberately swallowed cases are both mail sends, and both log before
continuing, because the user's data is already stored.

Pages that degrade rather than fail, the landing page, `/blog` and `/coffee`,
all log the reason before falling back. They did not at first, and the result
was that a misconfigured Sanity project produced a working-looking page with no
trace of why it was empty.

A 503 from a write endpoint carries a `hint` naming any environment variable
still holding a placeholder, built by `src/shared/config-check.ts`. Production
returns no hint: naming a misconfigured variable to an anonymous caller hands
an attacker a map of what is broken.

## 8.6 Logging

One JSON line per event, written to stdout, collected by Vercel. No log
library, no transport, no correlation id: Vercel already attaches a request id
to every line. `src/shared/logger.ts` carries the `ponytail:` comment naming
when to replace it.

Nothing logs an email body, a token, or a Stripe secret. Emails appear in logs
as plain addresses, which is deliberate for debugging a grant and is the one
piece of personal data in the log stream.

## 8.7 Theming

A theme is a block of CSS custom properties in `src/app/themes.css`. Components
reference only the Tailwind tokens mapped from those properties in
`globals.css`, so no component knows which theme is active.

| Step | Where |
|------|-------|
| Define tokens | `src/app/themes.css`, one `[data-theme="..."]` block |
| Register the preset | `THEMES` in `src/components/theme/themes.ts` |
| Render the active theme | `data-theme` on `<html>` in the root layout, read from a cookie |
| Switch | `applyTheme` in `src/components/theme/apply-theme.ts`, called by the header switcher and the gallery |
| Compare | `/themes` renders all five previews at once |

Server-rendering the attribute from the cookie is what avoids a flash of the
wrong palette. An unknown cookie value falls back to `minimalist` through
`isThemeId`, so a tampered cookie cannot produce an unstyled page.

Theme selectors are `[data-theme="..."]`, not `html[data-theme="..."]`. That is
deliberate: it lets `/themes` put the attribute on a preview wrapper and render
every preset live on one page, using the same components, with no iframe and no
duplicated markup.

Adding a sixth theme is one CSS block and one array entry. No component
changes, and no new class names.

## 8.8 Rate limiting

`src/lib/rate-limit.ts` is a fixed window in a `Map`, five requests per minute
per IP on the public forms and ten on checkout. It is per serverless instance,
which the file says out loud. It stops a single script; it is not a global
limit, and the upgrade path is Vercel Firewall rules or Upstash.

## 8.9 Unsubscribing

Addresses are guessable, so an unsubscribe link carries an HMAC-SHA256
signature over the lowercased address, keyed by `NEWSLETTER_SECRET`.
`verifyEmailToken` compares with `timingSafeEqual` on equal-length buffers.

The endpoint is POST only. A GET that unsubscribed would fire on every mail
client link prefetch and security scan, which silently removes people who never
clicked. The page therefore renders a confirm button, and the same URL also
serves RFC 8058 one-click requests, whose body is a fixed form field rather than
JSON. That is why the address and signature live in the query string.

The write is a soft delete: `unsubscribed_at` is set, the row stays, and the
campaign query filters on `unsubscribed_at is null`. Re-subscribing clears the
timestamp through the existing upsert, so nothing special handles a returning
subscriber.

Rotating `NEWSLETTER_SECRET` invalidates every link already in an inbox.
Section 11 records that cost.

## 8.10 Crawlers

`src/app/robots.ts` disallows `/api/`, `/auth/`, `/studio`, `/profile`,
`/unsubscribe` and `/success`. The editor and the personal pages have no
business in a search index, and `/unsubscribe` carries a signed token.

`src/app/sitemap.ts` lists the static paths plus every published post, premium
ones included: titles and excerpts are public, and only the body is gated. A
failed Sanity query degrades to the static paths with a warning, because a
missing sitemap costs more than a stale one.

## 8.11 Security headers

Set in `next.config.ts` for every route: `nosniff`, `SAMEORIGIN`,
`strict-origin-when-cross-origin`, a `Permissions-Policy` that denies camera,
microphone and geolocation, and HSTS with a two-year max-age.

The CSP ships as `Content-Security-Policy-Report-Only`. Next injects inline
bootstrap scripts and Sanity Studio needs `unsafe-eval`, so enforcing before
reading real reports breaks the application. The header name is the only thing
that changes when the reports come back clean.
