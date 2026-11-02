# 6. Runtime view

Four flows. They were chosen because each one is where a mistake costs
something real: money, access, or a mailing list.

## 6.1 Reading a premium post

The gate is the GROQ query, not the component. For a locked post the body is
never resolved, so it never enters this process.

```mermaid
sequenceDiagram
  actor Reader
  participant Page as /blog/[slug]
  participant Ent as entitlements.service
  participant SB as Supabase (RLS)
  participant Q as posts.queries
  participant SAN as Sanity

  Reader->>Page: GET /blog/my-post
  Page->>Ent: hasPremium()
  Ent->>SB: select id from entitlements where kind='premium'
  Note over SB: Policy limits rows to auth.uid() or auth.email()
  SB-->>Ent: 0 rows
  Ent-->>Page: false
  Page->>Q: getPost("my-post", entitled=false)
  Q->>SAN: GROQ, body resolved only if not premium or $entitled
  SAN-->>Q: summary fields, body = null
  Q-->>Page: { locked: true, body: null }
  Page->>Page: assertNoLeak(post)
  Page-->>Reader: Title, excerpt, paywall
```

## 6.2 Buying a coffee

Price and currency come from `src/env.ts`. The request only carries a quantity,
and the quantity is clamped to 1 to 20 by Zod.

```mermaid
sequenceDiagram
  actor Buyer
  participant UI as CoffeeButton
  participant API as POST /api/checkout
  participant CS as checkout.service
  participant ST as Stripe
  participant WH as POST /api/stripe/webhook
  participant EN as entitlements.service
  participant SB as Supabase (service role)

  Buyer->>UI: Click "Buy me a coffee"
  UI->>API: { quantity, email?, slug? }
  API->>API: rate limit, Zod parse, getCurrentUser()
  API->>CS: createCheckoutSession(input, user)
  CS->>ST: sessions.create(unit_amount from env, metadata{email,user_id})
  ST-->>CS: { url }
  CS-->>UI: { url }
  UI->>ST: redirect to hosted Checkout
  Buyer->>ST: Pays
  ST-->>Buyer: redirect /success?next=...
  ST->>WH: checkout.session.completed (signed)
  WH->>WH: constructEvent() with STRIPE_WEBHOOK_SECRET
  WH->>EN: grantPremium(email, event.id)
  EN->>SB: upsert entitlements on conflict (stripe_event_id) do nothing
  SB-->>EN: ok
  WH-->>ST: 200
```

Failure handling that matters:

| Failure | Response | Why |
|---------|----------|-----|
| Signature missing or wrong | 400 | Stripe stops retrying, and nothing is granted |
| Grant write fails | 500 | Stripe retries, and the unique `stripe_event_id` makes the retry safe |
| Event replayed | 200, no second row | `on conflict do nothing` |
| Paid but not signed in | Granted to the receipt email | The read policy matches on `auth.email()` later |

## 6.3 Subscribing to the newsletter

The address is stored first. Mail delivery is best effort, because a Resend
outage must not show the visitor a failed subscribe.

```mermaid
sequenceDiagram
  actor Visitor
  participant F as EmailCapture
  participant API as POST /api/newsletter
  participant S as newsletter.service
  participant SB as Supabase (service role)
  participant RS as Resend

  Visitor->>F: email (+ name)
  F->>API: POST JSON
  API->>API: rate limit 5/min/IP, Zod parse (trim, lowercase)
  API->>S: subscribe(input)
  S->>SB: select existing by email
  S->>SB: upsert on conflict (email), clear unsubscribed_at
  alt first time
    S->>RS: contacts.create + welcome email
    RS--xS: failure is logged, not propagated
  end
  S-->>API: { alreadySubscribed }
  API-->>Visitor: 200 with the matching message
```

## 6.4 Magic-link sign in

```mermaid
sequenceDiagram
  actor User
  participant LF as LoginForm (browser)
  participant GT as Supabase Auth
  participant CB as GET /auth/callback
  participant MW as Proxy (src/proxy.ts)

  User->>LF: email
  LF->>GT: signInWithOtp(emailRedirectTo=/auth/callback?next=...)
  GT-->>User: Email with a one-hour link
  User->>CB: GET /auth/callback?code=...&next=/profile
  CB->>CB: accept `next` only if it starts with "/"
  CB->>GT: exchangeCodeForSession(code)
  GT-->>CB: session, Set-Cookie
  CB-->>User: 302 to /profile
  User->>MW: GET /profile
  MW->>GT: getUser() and refresh the cookie
  MW-->>User: pass through, or 307 to /login if anonymous
```

Open-redirect protection lives in two places on purpose: `/auth/callback`
rejects any `next` that is not a same-origin path, and `/success` does the same
with its own `next`.
