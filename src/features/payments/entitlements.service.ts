import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/shared/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const PREMIUM = "premium" as const;

/**
 * Grants premium to an email. Keyed by email rather than user id so a buyer who
 * pays before signing up still gets access when they create the account with
 * the same address. `onConflict` makes a replayed Stripe event a no-op.
 */
export async function grantPremium(params: {
  email: string;
  userId: string | null;
  stripeEventId: string;
  amountTotal: number;
  currency: string;
}): Promise<boolean> {
  const { error } = await supabaseAdmin.from("entitlements").upsert(
    {
      email: params.email.toLowerCase(),
      user_id: params.userId || null,
      kind: PREMIUM,
      stripe_event_id: params.stripeEventId,
      amount_total: params.amountTotal,
      currency: params.currency,
    },
    { onConflict: "stripe_event_id", ignoreDuplicates: true },
  );

  if (error) {
    logger.error("entitlement grant failed", {
      event: params.stripeEventId,
      reason: error.message,
    });
    return false;
  }
  return true;
}

/**
 * True when the signed-in user has bought a coffee. Runs under row level
 * security, so a user can only ever see their own entitlements.
 */
export async function hasPremium(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;

  const { data, error } = await supabase
    .from("entitlements")
    .select("id")
    .eq("kind", PREMIUM)
    .limit(1);

  if (error) {
    logger.warn("entitlement check failed", { reason: error.message });
    return false;
  }
  return (data ?? []).length > 0;
}
