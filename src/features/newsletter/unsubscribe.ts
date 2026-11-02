import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/env";
import { publicEnv } from "@/env.public";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/shared/logger";
import { type Result, err, ok } from "@/shared/result";

/**
 * Unsubscribe links are signed. Without a signature, anyone who knows an
 * address could remove it from the list, and addresses are guessable.
 */
export const signEmail = (email: string): string =>
  createHmac("sha256", env.NEWSLETTER_SECRET)
    .update(email.trim().toLowerCase())
    .digest("base64url");

export function verifyEmailToken(email: string, token: string): boolean {
  const expected = Buffer.from(signEmail(email));
  const presented = Buffer.from(token);
  return expected.length === presented.length && timingSafeEqual(expected, presented);
}

/** The link that goes in every mail. Absolute, because it is read from an inbox. */
export const unsubscribeUrl = (email: string): string => {
  const url = new URL("/unsubscribe", publicEnv.NEXT_PUBLIC_SITE_URL);
  url.searchParams.set("e", email.trim().toLowerCase());
  url.searchParams.set("t", signEmail(email));
  return url.toString();
};

export type UnsubscribeError = "BAD_TOKEN" | "STORAGE_ERROR";

export async function unsubscribe(
  email: string,
  token: string,
): Promise<Result<{ wasSubscribed: boolean }, UnsubscribeError>> {
  const normalized = email.trim().toLowerCase();
  if (!verifyEmailToken(normalized, token)) {
    logger.warn("unsubscribe token rejected", { email: normalized });
    return err("BAD_TOKEN");
  }

  // Soft delete: the row stays so a re-subscribe is an update and the campaign
  // query filters on `unsubscribed_at is null`.
  const { data, error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("email", normalized)
    .is("unsubscribed_at", null)
    .select("email");

  if (error) {
    logger.error("unsubscribe update failed", { reason: error.message });
    return err("STORAGE_ERROR");
  }

  logger.info("unsubscribed", { email: normalized, rows: (data ?? []).length });
  return ok({ wasSubscribed: (data ?? []).length > 0 });
}
