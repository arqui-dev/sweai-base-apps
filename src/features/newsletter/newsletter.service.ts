import { env } from "@/env";
import { MAIL_FROM, resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/shared/logger";
import { type Result, err, ok } from "@/shared/result";
import type { SubscribeInput } from "./newsletter.schema";

export type SubscribeError = "STORAGE_ERROR";

/**
 * Idempotent on email: a repeat subscribe refreshes the row instead of
 * creating a duplicate, and the welcome mail is sent only on first insert.
 */
export async function subscribe(
  input: SubscribeInput,
): Promise<Result<{ alreadySubscribed: boolean }, SubscribeError>> {
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("email")
    .eq("email", input.email)
    .maybeSingle();

  if (lookupError) {
    logger.error("newsletter lookup failed", { reason: lookupError.message });
    return err("STORAGE_ERROR");
  }

  const { error: upsertError } = await supabaseAdmin
    .from("newsletter_subscribers")
    .upsert(
      {
        email: input.email,
        name: input.name ?? null,
        source: input.source,
        unsubscribed_at: null,
      },
      { onConflict: "email" },
    );

  if (upsertError) {
    logger.error("newsletter upsert failed", { reason: upsertError.message });
    return err("STORAGE_ERROR");
  }

  if (existing) return ok({ alreadySubscribed: true });

  // Delivery is best effort: the address is already stored, so a Resend outage
  // must not surface as a failed subscribe.
  await sendWelcome(input.email, input.name).catch((error: unknown) => {
    logger.error("welcome mail failed", {
      email: input.email,
      reason: error instanceof Error ? error.message : String(error),
    });
  });

  return ok({ alreadySubscribed: false });
}

async function sendWelcome(email: string, name?: string): Promise<void> {
  if (env.RESEND_AUDIENCE_ID) {
    await resend.contacts.create({ email, audienceId: env.RESEND_AUDIENCE_ID });
  }

  await resend.emails.send({
    from: MAIL_FROM,
    to: email,
    subject: "You are on the list",
    html: `<p>Hi ${name ?? "there"},</p>
<p>Thanks for subscribing. New posts land in your inbox, nothing else.</p>
<p>Premium posts unlock for the price of one coffee.</p>`,
  });
}

export type CampaignResult = { sent: number; failed: number };

/** Sends one campaign to active subscribers, in batches Resend accepts. */
export async function sendCampaign(
  subject: string,
  html: string,
  limit: number,
): Promise<Result<CampaignResult, "STORAGE_ERROR">> {
  const { data, error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("email")
    .is("unsubscribed_at", null)
    .limit(limit);

  if (error) {
    logger.error("campaign recipient query failed", { reason: error.message });
    return err("STORAGE_ERROR");
  }

  const recipients = (data ?? []).map((row) => row.email as string);
  let sent = 0;
  let failed = 0;

  // Resend accepts up to 100 messages per batch call.
  for (let i = 0; i < recipients.length; i += 100) {
    const batch = recipients.slice(i, i + 100);
    try {
      await resend.batch.send(
        batch.map((to) => ({ from: MAIL_FROM, to, subject, html })),
      );
      sent += batch.length;
    } catch (error: unknown) {
      failed += batch.length;
      logger.error("campaign batch failed", {
        size: batch.length,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return ok({ sent, failed });
}
