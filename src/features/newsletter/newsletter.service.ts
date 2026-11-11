import { env } from "@/env";
import { MAIL_FROM, resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { escapeHtml } from "@/shared/escape-html";
import { logger } from "@/shared/logger";
import { reasonOf } from "@/shared/reason";
import { type Result, err, ok } from "@/shared/result";
import type { SubscribeInput } from "./newsletter.schema";
import { unsubscribeUrl } from "./unsubscribe";

export type SubscribeError = "STORAGE_ERROR";

/**
 * Idempotent on email: a repeat subscribe refreshes the row instead of
 * creating a duplicate, and the welcome mail is sent only on first insert.
 */
export async function subscribe(
  input: SubscribeInput,
  /**
   * True only when the caller proved control of this mailbox, which today
   * means a signed-in session whose email matches. Anonymous callers cannot
   * resurrect an address that opted out: one request chooses the address, so
   * without this anyone could put a person who unsubscribed back on the list
   * and cause mail to be sent to them.
   */
  options: { readonly allowResubscribe: boolean } = { allowResubscribe: false },
): Promise<Result<{ alreadySubscribed: boolean }, SubscribeError>> {
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("email, unsubscribed_at")
    .eq("email", input.email)
    .maybeSingle();

  if (lookupError) {
    logger.error("newsletter lookup failed", { reason: lookupError.message });
    return err("STORAGE_ERROR");
  }

  const optedOut = Boolean(existing?.unsubscribed_at);
  if (optedOut && !options.allowResubscribe) {
    // Treated as a no-op rather than an error, so the response cannot be used
    // to tell an opted-out address from an unknown one.
    logger.info("resubscribe refused for an opted-out address");
    return ok({ alreadySubscribed: true });
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
      reason: reasonOf(error),
    });
  });

  return ok({ alreadySubscribed: false });
}

async function sendWelcome(email: string, name?: string): Promise<void> {
  if (env.RESEND_AUDIENCE_ID) {
    await resend.contacts.create({ email, audienceId: env.RESEND_AUDIENCE_ID });
  }

  const leave = unsubscribeUrl(email);

  await resend.emails.send({
    from: MAIL_FROM,
    to: email,
    subject: "You are on the list",
    html: `<p>Hi ${escapeHtml(name ?? "there")},</p>
<p>Thanks for subscribing. New posts land in your inbox, nothing else.</p>
<p>Premium posts unlock for the price of one coffee.</p>
${footer(leave)}`,
    headers: listUnsubscribeHeaders(leave),
  });
}

/** Every mail carries a working way out. The subscribe page promises this. */
const footer = (leave: string): string =>
  `<hr /><p style="font-size:12px;color:#71717a">
You are receiving this because you subscribed at Hire Service.
<a href="${leave}">Unsubscribe</a>.</p>`;

/**
 * RFC 8058 one-click unsubscribe. Mail clients render their own unsubscribe
 * button from these, which gets the address off the list without a round trip
 * through the browser.
 */
const listUnsubscribeHeaders = (leave: string): Record<string, string> => ({
  "List-Unsubscribe": `<${leave}>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
});

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
        batch.map((to) => {
          const leave = unsubscribeUrl(to);
          return {
            from: MAIL_FROM,
            to,
            subject,
            html: `${html}${footer(leave)}`,
            headers: listUnsubscribeHeaders(leave),
          };
        }),
      );
      sent += batch.length;
    } catch (error: unknown) {
      failed += batch.length;
      logger.error("campaign batch failed", {
        size: batch.length,
        reason: reasonOf(error),
      });
    }
  }

  return ok({ sent, failed });
}
