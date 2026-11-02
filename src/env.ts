import { randomBytes } from "node:crypto";
import { z } from "zod";

/**
 * Server-side environment. The only module in the app that reads `process.env`
 * for secrets. Validated once at import time so a malformed key fails the boot,
 * not the first customer request.
 *
 * An empty or missing variable is treated as "not configured yet" rather than
 * as a fatal error, so the application deploys and renders before any account
 * exists. Every feature behind a missing variable degrades: writes answer 503
 * with a hint naming what is unset, and reads log and fall back.
 *
 * Secrets never fall back to a fixed string. The placeholder values committed
 * for CI are public, so substituting one for an empty `ADMIN_API_TOKEN` would
 * hand the admin endpoint to anyone who can read this repository. Unset secrets
 * get random bytes instead, which makes every check against them fail closed.
 */

const unconfiguredNames: string[] = [];

const randomSecret = (): string => randomBytes(24).toString("base64url");

/** Returns the value, or a safe stand-in while recording the name as unset. */
function orFallback(name: string, raw: string | undefined, fallback: () => string): string {
  const trimmed = raw?.trim();
  if (trimmed) return trimmed;
  unconfiguredNames.push(name);
  return fallback();
}

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Prefix-checked so a publishable key pasted here fails the boot instead of
  // silently losing every service-role write to row level security.
  SUPABASE_SECRET_KEY: z
    .string()
    .min(1)
    .refine((v) => v.startsWith("sb_secret_") || v.startsWith("eyJ"), {
      message: 'must be a Supabase secret key ("sb_secret_...") or a legacy service_role JWT',
    }),

  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  COFFEE_UNIT_AMOUNT: z.coerce.number().int().min(100).max(100_000).default(500),
  COFFEE_CURRENCY: z.string().length(3).default("usd"),

  SANITY_API_READ_TOKEN: z.string().min(1).optional(),

  RESEND_API_KEY: z.string().startsWith("re_"),
  RESEND_FROM: z.string().min(3),
  RESEND_AUDIENCE_ID: z.string().min(1).optional(),

  ADMIN_API_TOKEN: z.string().min(16),
  /** Signs unsubscribe links. Rotating it invalidates links already mailed. */
  NEWSLETTER_SECRET: z.string().min(32),
});

const readToken = process.env.SANITY_API_READ_TOKEN?.trim();
const audienceId = process.env.RESEND_AUDIENCE_ID?.trim();

const parsed = serverSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  COFFEE_UNIT_AMOUNT: process.env.COFFEE_UNIT_AMOUNT?.trim() || undefined,
  COFFEE_CURRENCY: process.env.COFFEE_CURRENCY?.trim() || undefined,

  // Network identifiers. A stand-in here produces a failed request, which the
  // callers already catch, log and degrade from.
  SUPABASE_SECRET_KEY: orFallback(
    "SUPABASE_SECRET_KEY",
    process.env.SUPABASE_SECRET_KEY,
    () => `sb_secret_${randomSecret()}`,
  ),
  STRIPE_SECRET_KEY: orFallback(
    "STRIPE_SECRET_KEY",
    process.env.STRIPE_SECRET_KEY,
    () => `sk_test_${randomSecret()}`,
  ),
  RESEND_API_KEY: orFallback(
    "RESEND_API_KEY",
    process.env.RESEND_API_KEY,
    () => `re_${randomSecret()}`,
  ),
  RESEND_FROM: orFallback(
    "RESEND_FROM",
    process.env.RESEND_FROM,
    () => "unconfigured@example.invalid",
  ),

  // Verification secrets. Random bytes mean every signature and token check
  // fails, which is the correct behaviour for an unconfigured deployment.
  STRIPE_WEBHOOK_SECRET: orFallback(
    "STRIPE_WEBHOOK_SECRET",
    process.env.STRIPE_WEBHOOK_SECRET,
    () => `whsec_${randomSecret()}`,
  ),
  ADMIN_API_TOKEN: orFallback("ADMIN_API_TOKEN", process.env.ADMIN_API_TOKEN, randomSecret),
  NEWSLETTER_SECRET: orFallback(
    "NEWSLETTER_SECRET",
    process.env.NEWSLETTER_SECRET,
    () => randomSecret() + randomSecret(),
  ),

  ...(readToken ? { SANITY_API_READ_TOKEN: readToken } : {}),
  ...(audienceId ? { RESEND_AUDIENCE_ID: audienceId } : {}),
});

if (!parsed.success) {
  console.error("Invalid server environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Invalid server environment. See .env.example.");
}

export const env = parsed.data;

/** Server variables that were empty or missing at boot. */
export const unconfiguredServerVars: readonly string[] = unconfiguredNames;
