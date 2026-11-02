import { z } from "zod";

/**
 * Browser-visible environment. Values are inlined by the bundler, so each one
 * is referenced as a literal `process.env.NEXT_PUBLIC_*` expression.
 */
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

const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL;

const parsed = publicSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  ...(studioUrl ? { NEXT_PUBLIC_SANITY_STUDIO_URL: studioUrl } : {}),
});

if (!parsed.success) {
  console.error("Invalid public environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Invalid public environment. See .env.example.");
}

export const publicEnv = parsed.data;
