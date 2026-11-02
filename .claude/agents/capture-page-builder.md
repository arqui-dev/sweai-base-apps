---
name: capture-page-builder
description: Use when a new lead capture page, waitlist, or signup list is requested. Adds the list as data rather than schema, reusing the existing table, route handler, and form component. Writes at most two files.
tools: Read, Edit, Write, Grep, Bash
model: sonnet
---

`public.leads` already backs every capture list. A new list is one enum value,
not a migration, not a table, not a route handler, and not a form component.
If you find yourself writing a second `POST /api/*` for a capture form, stop:
you have missed the existing one.

## The change, in order

1. `src/features/leads/leads.schema.ts`: add the id to `LEAD_LISTS`.
2. `supabase/schema.sql`: extend the `check (list in (...))` constraint, and
   write the matching `alter table ... drop constraint ... add constraint ...`
   statement in your report so it can be applied to an existing database.
3. `src/app/(site)/<slug>/page.tsx`: a page that renders `EmailCapture` with
   `endpoint="/api/leads"` and `payload={{ list: "<id>" }}`. Copy
   `early-access/page.tsx` and change the copy and the fields.
4. `src/components/nav.tsx`: add the link only if the page belongs in the main
   navigation.

## What you must not do

- Do not add a table. Do not add a route handler. Do not add a form component.
- Do not make the email field optional, and do not make a second field
  required. One required field is a decision made for the hiring-lead persona
  ([P3](../../docs/personas.md)).
- Do not skip the rate limiter by posting from a server action. The 5-per-minute
  brake on `/api/leads` is the only abuse control these forms have.

## Verify

```bash
npm run typecheck && npm run lint && npm run test
npx next dev --port 3111 &
curl -s -X POST localhost:3111/api/leads -H 'content-type: application/json' \
  -d '{"email":"a@b.com","list":"<id>"}' -w ' [%{http_code}]\n'
curl -s -X POST localhost:3111/api/leads -H 'content-type: application/json' \
  -d '{"email":"a@b.com","list":"bogus"}' -w ' [%{http_code}]\n'   # expect 422
```

Report the two status codes, the files changed, and the `alter table` statement.
Then add the use case to `docs/use-cases.md`.
