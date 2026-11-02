import { handleStripeWebhook } from "@/features/payments/webhook.service";
import { json } from "@/shared/http";

/**
 * Signature verification needs the exact bytes Stripe signed, so this handler
 * reads the raw body and never touches `request.json()`.
 */
export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const result = await handleStripeWebhook(rawBody, request.headers.get("stripe-signature"));

  if (!result.ok) {
    // 400 on a bad signature stops Stripe retrying garbage; 500 on a failed
    // grant makes Stripe retry, which is what we want.
    return json({ message: result.error }, result.error === "BAD_SIGNATURE" ? 400 : 500);
  }
  return json(result.value);
}
