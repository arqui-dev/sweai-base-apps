import { env, unconfiguredServerVars } from "@/env";
import { publicEnv, unconfiguredPublicVars } from "@/env.public";

/**
 * Two ways a variable can be unconfigured, and both have to be reported.
 *
 * Empty or missing: `env.ts` records the name and substitutes a stand-in, which
 * for a secret is random bytes. Pattern matching cannot find those, so the
 * recorded list is the only source.
 *
 * Set to one of the committed placeholder values: common when someone copies
 * `.env.example` or the CI block. Those are found by pattern.
 */
export const looksPlaceholder = (value: string): boolean =>
  // `\bREPLACE\b` catches the .env.example spellings, including the ones
  // embedded in a URL like https://REPLACE.supabase.co.
  /placeholder|replace_me|\breplace\b|unconfigured/i.test(value);

export function placeholderEnvVars(): readonly string[] {
  const byPattern = Object.entries({
    NEXT_PUBLIC_SUPABASE_URL: publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SANITY_PROJECT_ID: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
    // Optional today and read by nothing, so an unset value is correct. It is
    // listed because the moment the dataset goes private this token becomes
    // the only thing standing between the blog and an empty page: Sanity
    // answers an unauthenticated read of a private dataset with HTTP 200 and
    // an empty result, not an error, so a REPLACE value here would render a
    // blank blog and report nothing.
    SANITY_API_READ_TOKEN: env.SANITY_API_READ_TOKEN ?? "",
    SUPABASE_SECRET_KEY: env.SUPABASE_SECRET_KEY,
    STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: env.RESEND_API_KEY,
    ADMIN_API_TOKEN: env.ADMIN_API_TOKEN,
    NEWSLETTER_SECRET: env.NEWSLETTER_SECRET,
  })
    .filter(([, value]) => looksPlaceholder(value))
    .map(([name]) => name);

  return [...new Set([...unconfiguredServerVars, ...unconfiguredPublicVars, ...byPattern])].sort();
}

/**
 * Attached to a 503 body outside production only. Naming an environment
 * variable to an anonymous caller would hand an attacker a map of what is
 * misconfigured, so production says nothing.
 */
export function setupHint(): string | undefined {
  if (env.NODE_ENV === "production") return undefined;

  const pending = placeholderEnvVars();
  if (pending.length === 0) return undefined;

  return `Setup incomplete. Still unset in .env.local: ${pending.join(", ")}`;
}
