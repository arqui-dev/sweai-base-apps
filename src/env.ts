import { z } from "zod";

/**
 * Server-side environment. The only module in the app that reads `process.env`
 * for secrets. Validated once at import time so a missing key fails the boot,
 * not the first customer request.
 */
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

const parsed = serverSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid server environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Invalid server environment. See .env.example.");
}

export const env = parsed.data;
