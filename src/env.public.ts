import { z } from "zod";

/**
 * Browser-visible environment. Values are inlined by the bundler, so each one
 * is referenced as a literal `process.env.NEXT_PUBLIC_*` expression.
 *
 * As on the server, an empty variable means "not configured yet" rather than a
 * fatal error. Nothing here is secret, so the stand-ins are fixed strings
 * rather than random: a request to an unconfigured host fails, and the callers
 * already catch, log and degrade from that.
 */

const unconfiguredNames: string[] = [];

function orFallback(name: string, raw: string | undefined, fallback: string): string {
  const trimmed = raw?.trim();
  if (trimmed) return trimmed;
  unconfiguredNames.push(name);
  return fallback;
}

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  // This value ships to every browser. Rejecting an "sb_secret_" prefix here is
  // the cheapest guard against the one paste that would leak the whole database.
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1)
    .refine((v) => !v.startsWith("sb_secret_") && !v.startsWith("sk_"), {
      message: "looks like a secret key. Never put a secret in a NEXT_PUBLIC_ variable",
    }),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1).default("production"),
  /**
   * Hosted Studio address, e.g. https://arqui-dev.sanity.studio. Optional
   * because the hostname is chosen at `sanity deploy` time and cannot be
   * derived from the project id. The footer link only renders when it is set.
   */
  NEXT_PUBLIC_SANITY_STUDIO_URL: z.string().url().optional(),
});

/**
 * Fallback chain for the site URL, in the order that is actually correct.
 *
 * NEXT_PUBLIC_VERCEL_URL is the immutable per-deployment host, not the project
 * alias, and on a project with deployment protection it answers every
 * anonymous request with a redirect to the Vercel SSO page. Using it in
 * production pointed magic-link callbacks, Stripe redirects, unsubscribe links
 * and the sitemap at a host no visitor can load. It is still the right answer
 * for a preview, where there is no stable alias.
 *
 * NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL is the project's production alias,
 * which is what production needs when nobody has set a custom domain.
 */
const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV?.trim();
const deploymentUrl = process.env.NEXT_PUBLIC_VERCEL_URL?.trim();
const productionUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.trim();

const siteFallback =
  vercelEnv === "production" && productionUrl
    ? `https://${productionUrl}`
    : deploymentUrl
      ? `https://${deploymentUrl}`
      : "http://localhost:3000";

const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL?.trim();

const parsed = publicSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: orFallback(
    "NEXT_PUBLIC_SITE_URL",
    process.env.NEXT_PUBLIC_SITE_URL,
    siteFallback,
  ),
  NEXT_PUBLIC_SUPABASE_URL: orFallback(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "https://unconfigured.supabase.co",
  ),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: orFallback(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    "sb_publishable_unconfigured",
  ),
  NEXT_PUBLIC_SANITY_PROJECT_ID: orFallback(
    "NEXT_PUBLIC_SANITY_PROJECT_ID",
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    "unconfigured",
  ),
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || undefined,
  ...(studioUrl ? { NEXT_PUBLIC_SANITY_STUDIO_URL: studioUrl } : {}),
});

if (!parsed.success) {
  console.error("Invalid public environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Invalid public environment. See .env.example.");
}

export const publicEnv = parsed.data;

/** Public variables that were empty or missing at build time. */
export const unconfiguredPublicVars: readonly string[] = unconfiguredNames;
