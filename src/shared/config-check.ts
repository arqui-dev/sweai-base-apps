import { env } from "@/env";
import { publicEnv } from "@/env.public";

/**
 * The repository ships placeholder credentials so the build never needs real
 * ones. The cost is that an unconfigured service fails at the first write with
 * whatever the provider says, which for Supabase is a bare "Invalid API key"
 * in a server log. This turns that into a sentence naming the variable.
 */
export const looksPlaceholder = (value: string): boolean =>
  // `\bREPLACE\b` catches the .env.example spellings, including the ones
  // embedded in a URL like https://REPLACE.supabase.co.
  /placeholder|replace_me|\breplace\b/i.test(value);

export function placeholderEnvVars(): readonly string[] {
  const configured: Record<string, string> = {
    NEXT_PUBLIC_SUPABASE_URL: publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: env.SUPABASE_SECRET_KEY,
    STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_SANITY_PROJECT_ID: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
    RESEND_API_KEY: env.RESEND_API_KEY,
    ADMIN_API_TOKEN: env.ADMIN_API_TOKEN,
    NEWSLETTER_SECRET: env.NEWSLETTER_SECRET,
  };

  return Object.entries(configured)
    .filter(([, value]) => looksPlaceholder(value))
    .map(([name]) => name);
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

  return `Setup incomplete. Still placeholders in .env.local: ${pending.join(", ")}`;
}
