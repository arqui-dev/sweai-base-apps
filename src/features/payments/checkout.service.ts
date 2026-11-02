import { COFFEE, stripe } from "@/lib/stripe";
import { publicEnv } from "@/env.public";
import { type Result, err, ok } from "@/shared/result";
import { logger } from "@/shared/logger";
import type { CheckoutInput } from "./payments.schema";

export type CheckoutError = "NO_SUBJECT" | "STRIPE_ERROR";

/**
 * One Stripe Checkout session for N coffees. The amount is built here from
 * server config, never from the request, so a tampered payload cannot change
 * the price.
 */
export async function createCheckoutSession(
  input: CheckoutInput,
  user: { id: string; email?: string | undefined } | null,
): Promise<Result<{ url: string }, CheckoutError>> {
  const email = user?.email ?? input.email;
  if (!email) return err("NO_SUBJECT");

  const base = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const next = input.slug ? `/blog/${input.slug}` : "/profile";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          quantity: input.quantity,
          price_data: {
            currency: COFFEE.currency,
            unit_amount: COFFEE.unitAmount,
            product_data: {
              name: "A coffee",
              description: "Unlocks every premium post on this site.",
            },
          },
        },
      ],
      // Read back by the webhook. Keep it small: Stripe caps metadata values.
      metadata: {
        email,
        user_id: user?.id ?? "",
        quantity: String(input.quantity),
      },
      success_url: `${base}/success?next=${encodeURIComponent(next)}`,
      cancel_url: `${base}${next}`,
    });

    if (!session.url) {
      logger.error("checkout session returned no url", { id: session.id });
      return err("STRIPE_ERROR");
    }
    return ok({ url: session.url });
  } catch (error: unknown) {
    logger.error("checkout session create failed", {
      reason: error instanceof Error ? error.message : String(error),
    });
    return err("STRIPE_ERROR");
  }
}
