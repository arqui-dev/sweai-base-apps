import { createCheckoutSession } from "@/features/payments/checkout.service";
import { checkoutInput } from "@/features/payments/payments.schema";
import { allow, clientKey } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/supabase/server";
import { json, parseBody } from "@/shared/http";

export async function POST(request: Request): Promise<Response> {
  if (!allow(clientKey(request, "checkout"), 10)) {
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
    return json({ message: "Payment provider unavailable." }, 503);
  }

  return json(result.value);
}
