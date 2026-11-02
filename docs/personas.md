# Personas

Five personas. Each one exists because a design decision in this repo was made
for them, and each names the moment they arrive, what they will not tolerate,
and the one metric that tells you they were served.

## P1: Mara, the skimming visitor

Senior engineer at a 200-person company. Found a post through a link in a Slack
channel, has four other tabs open, and will decide in about eight seconds
whether to keep reading.

| | |
|---|---|
| Arrives at | A blog post, never the landing page |
| Wants | To know if the post answers her question |
| Will not tolerate | A newsletter modal before she has read a paragraph |
| Serve her with | Excerpt above the fold, reading time, no interstitial. The newsletter form is a section near the bottom, not a popup |
| Served when | She reaches the end of a post |

## P2: Dan, the paying reader

Reads two premium posts a month. Does not want a subscription, does not want to
create an account, and resents a signup wall in front of a $5 purchase.

| | |
|---|---|
| Arrives at | A premium post, from search |
| Wants | To read the thing now, and pay once |
| Will not tolerate | Making an account before paying, or a recurring charge |
| Serve him with | Guest checkout with a receipt email, entitlement keyed to that email, and a clear path to sign in later ([ADR-003](adr/ADR-003-entitlements-keyed-by-email.md)) |
| Served when | He is reading within two clicks of the paywall |

## P3: Priya, the hiring lead

Engineering manager with a budget and a deadline. Scanning three consultants.
She reads the posts to judge whether the work is real.

| | |
|---|---|
| Arrives at | The landing page, after reading a post |
| Wants | To know what is actually for sale, and to start a conversation |
| Will not tolerate | A contact form that asks nine questions, or vague service descriptions |
| Serve her with | Three named engagements with specifics, and a four-field early-access form where only the email is required |
| Served when | A lead row lands with a filled-in `note` |

## P4: Theo, the content editor

Writes and publishes. Not a developer. Will not open a pull request to fix a
typo.

| | |
|---|---|
| Arrives at | `/studio` |
| Wants | To publish, and to mark a post premium with one switch |
| Will not tolerate | Needing a deploy to change a sentence |
| Serve him with | Sanity Studio in the app, `isPremium` as a boolean field, a required `excerpt` so every locked post has a teaser, and 60 second revalidation so a fix appears without a build |
| Served when | He publishes without talking to anyone |

## P5: Alex, the next engineer

Copies this repo to start a different product. Could be the owner in six
months, could be a contractor, could be an AI agent.

| | |
|---|---|
| Arrives at | `README.md`, then `docs/arc42/` |
| Wants | To add a feature without reverse-engineering five integrations |
| Will not tolerate | Abstractions with no second implementation, or docs that describe a system that no longer exists |
| Serve them with | arc42 sections tied to real file paths, five ADRs with the reversal condition stated, `ponytail:` comments naming each shortcut's ceiling, and `npm run verify` that passes on a clean clone |
| Served when | A new capture page ships with no migration and no new dependency |

## How the personas map to decisions

| Persona | Decision made for them |
|---------|------------------------|
| Mara | No modal, no popup, excerpt-first post layout |
| Dan | Guest checkout, email-keyed entitlements, single payment and no subscription |
| Priya | Three concrete services, one required form field, lead `note` captured |
| Theo | Embedded Studio, `isPremium` boolean, required excerpt, 60s revalidate |
| Alex | arc42 plus ADRs, `features/lib/shared` split, one table for all lead lists |
