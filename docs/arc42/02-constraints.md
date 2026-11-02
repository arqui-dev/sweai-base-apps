# 2. Constraints

These were fixed before any code existed. They are not decisions, and the ADRs
in section 9 do not revisit them.

## Technical

| Constraint | Consequence |
|------------|-------------|
| Deploy target is Vercel | Serverless functions, no long-lived process, no local disk, no in-process scheduler |
| Node 22 LTS | `engines.node >= 22`, and CI pins the same major |
| Next.js App Router with React 19 | Server Components by default, `cookies()` and `params` are async |
| TypeScript strict, plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` | No `any`, no non-null assertions on external data |
| Tailwind CSS v4 for all styling | Tokens live in `@theme`, no CSS-in-JS in product code |
| Supabase for identity and relational data | Row level security is the authorization layer, not application `if` statements |
| Stripe for payment | No card data touches this application at all |
| Sanity for content | Posts are not in Postgres, and the blog has no database migration |
| Resend for email | No SMTP credentials, no mail server |

## Organizational

| Constraint | Consequence |
|------------|-------------|
| One engineer, part time | Fewest moving parts that satisfy the goals; no service nobody can operate |
| Study project, not a real company | Dummy content is acceptable; a leaked production secret is not |
| Ponytail full mode is the working style | Every abstraction has to justify itself, and deliberate shortcuts carry a `ponytail:` comment naming the upgrade path |
| Conventions come from `ai-software-engineering/` | `guidelines/typescript.md` for code, `guidelines/writing-style.md` for prose, `prompts/adrs/madr-template.md` for ADRs |
