import { subscribeInput } from "@/features/newsletter/newsletter.schema";
import { subscribe } from "@/features/newsletter/newsletter.service";
import { allow, clientKey } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/supabase/server";
import { setupHint } from "@/shared/config-check";
import { json, parseBody } from "@/shared/http";
import { logger } from "@/shared/logger";

export async function POST(request: Request): Promise<Response> {
  if (!allow(clientKey(request, "newsletter"))) {
    logger.warn("rate limit rejected", { scope: "newsletter" });
    return json({ message: "Too many requests. Try again in a minute." }, 429);
  }

  const parsed = await parseBody(request, subscribeInput);
  if (!parsed.ok) {
    return json({ message: parsed.error.message, fields: parsed.error.fields }, parsed.error.status);
  }

  // allowResubscribe only for a session that owns the address. A magic-link
  // session proves the mailbox was reachable, which is the same bar the
  // unsubscribe link clears.
  const user = await getCurrentUser();
  const ownsAddress = user?.email?.toLowerCase() === parsed.value.email;

  const result = await subscribe(parsed.value, { allowResubscribe: Boolean(ownsAddress) });
  if (!result.ok) {
    return json({ message: "Could not save your address.", hint: setupHint() }, 503);
  }

  // One message for every outcome. Two messages made this endpoint an
  // enumeration oracle: an anonymous caller could tell a subscribed address
  // from an unknown one.
  return json({ message: "Check your inbox to confirm." });
}
