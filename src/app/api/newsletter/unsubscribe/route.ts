import { z } from "zod";
import { unsubscribe } from "@/features/newsletter/unsubscribe";
import { allow, clientKey } from "@/lib/rate-limit";
import { setupHint } from "@/shared/config-check";
import { json } from "@/shared/http";

const query = z.object({
  e: z.string().trim().toLowerCase().email().max(254),
  t: z.string().min(16).max(128),
});

/**
 * POST only. A GET would let any link scanner or mail client prefetch somebody
 * off the list, and several do exactly that.
 *
 * Reads the address and signature from the query string so the same URL serves
 * both the confirmation page's fetch and an RFC 8058 one-click request, whose
 * body is a fixed form field rather than JSON.
 */
export async function POST(request: Request): Promise<Response> {
  if (!allow(clientKey(request, "unsubscribe"), 20)) {
    return json({ message: "Too many requests. Try again in a minute." }, 429);
  }

  const parsed = query.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) {
    return json({ message: "That unsubscribe link is incomplete." }, 400);
  }

  const result = await unsubscribe(parsed.data.e, parsed.data.t);
  if (!result.ok) {
    if (result.error === "BAD_TOKEN") {
      return json({ message: "That unsubscribe link is not valid." }, 403);
    }
    return json({ message: "Could not update your subscription.", hint: setupHint() }, 503);
  }

  return json({
    message: result.value.wasSubscribed
      ? "Done. You will not receive another newsletter."
      : "That address was already unsubscribed.",
  });
}
