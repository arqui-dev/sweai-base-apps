import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";
import { publicEnv } from "@/env.public";

/**
 * Service-role client. Bypasses row level security, so it is only reachable
 * from route handlers that have already authenticated the caller: the Stripe
 * webhook (signature-verified) and the newsletter sender (admin token).
 */
export const supabaseAdmin = createClient(
  publicEnv.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
