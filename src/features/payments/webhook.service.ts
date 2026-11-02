import type Stripe from "stripe";
import { env } from "@/env";
import { stripe } from "@/lib/stripe";
import { logger } from "@/shared/logger";
import { reasonOf } from "@/shared/reason";
import { type Result, err, ok } from "@/shared/result";
import { grantPremium } from "./entitlements.service";

export type WebhookError = "BAD_SIGNATURE" | "GRANT_FAILED";

/**
 * Verifies the Stripe signature before reading a single field. An unsigned body
 * is an attacker handing out free premium access.
 */
export async function handleStripeWebhook(
  rawBody: string,
  signature: string | null,
): Promise<Result<{ handled: string }, WebhookError>> {
  if (!signature) return err("BAD_SIGNATURE");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error: unknown) {
    logger.warn("stripe signature rejected", {
      reason: reasonOf(error),
    });
    return err("BAD_SIGNATURE");
  }

  if (event.type !== "checkout.session.completed") {
    return ok({ handled: `ignored:${event.type}` });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    logger.info("checkout completed without payment", { id: session.id });
    return ok({ handled: "ignored:unpaid" });
  }

  const email = session.metadata?.email ?? session.customer_details?.email;
  if (!email) {
    logger.error("paid session without email", { id: session.id });
    return ok({ handled: "ignored:no-email" });
  }

  const granted = await grantPremium({
    email,
    userId: session.metadata?.user_id ?? null,
    stripeEventId: event.id,
    amountTotal: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
  });

  if (!granted) return err("GRANT_FAILED");

  logger.info("premium granted", { email, event: event.id });
  return ok({ handled: "granted" });
}
