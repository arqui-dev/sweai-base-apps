import { subscribeInput } from "@/features/newsletter/newsletter.schema";
import { subscribe } from "@/features/newsletter/newsletter.service";
import { allow, clientKey } from "@/lib/rate-limit";
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

  const result = await subscribe(parsed.value);
  if (!result.ok) {
    return json({ message: "Could not save your address.", hint: setupHint() }, 503);
  }

  return json({
    message: result.value.alreadySubscribed
      ? "You are already on the list."
      : "Check your inbox to confirm.",
  });
}
