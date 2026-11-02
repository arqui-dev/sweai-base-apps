import { createCheckoutSession } from "@/features/payments/checkout.service";
import { checkoutInput } from "@/features/payments/payments.schema";
import { allow, clientKey } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/supabase/server";
import { setupHint } from "@/shared/config-check";
import { json, parseBody } from "@/shared/http";
import { logger } from "@/shared/logger";

export async function POST(request: Request): Promise<Response> {
  if (!allow(clientKey(request, "checkout"), 10)) {
    logger.warn("rate limit rejected", { scope: "checkout" });
    return json({ message: "Too many requests. Try again in a minute." }, 429);
  }

  const parsed = await parseBody(request, checkoutInput);
  if (!parsed.ok) {
    return json({ message: parsed.error.message, fields: parsed.error.fields }, parsed.error.status);
  }

  const user = await getCurrentUser();
  const result = await createCheckoutSession(
    parsed.value,
    user ? { id: user.id, email: user.email } : null,
  );

  if (!result.ok) {
    if (result.error === "NO_SUBJECT") {
      return json({ message: "Sign in or give us an email to send the receipt to." }, 400);
    }
    return json({ message: "Payment provider unavailable.", hint: setupHint() }, 503);
  }

  return json(result.value);
}
