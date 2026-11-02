import { timingSafeEqual } from "node:crypto";
import { env } from "@/env";
import { campaignInput } from "@/features/newsletter/newsletter.schema";
import { sendCampaign } from "@/features/newsletter/newsletter.service";
import { setupHint } from "@/shared/config-check";
import { json, parseBody } from "@/shared/http";
import { logger } from "@/shared/logger";

/** Constant-time compare so the token cannot be guessed byte by byte. */
function tokenMatches(presented: string | null): boolean {
  if (!presented) return false;
  const a = Buffer.from(presented);
  const b = Buffer.from(`Bearer ${env.ADMIN_API_TOKEN}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  if (!tokenMatches(request.headers.get("authorization"))) {
    logger.warn("admin token rejected", { route: "newsletter/send" });
    return json({ message: "Unauthorized." }, 401);
  }

  const parsed = await parseBody(request, campaignInput);
  if (!parsed.ok) {
    return json({ message: parsed.error.message, fields: parsed.error.fields }, parsed.error.status);
  }

  const { subject, html, limit } = parsed.value;
  const result = await sendCampaign(subject, html, limit);
  if (!result.ok) {
    return json({ message: "Could not load recipients.", hint: setupHint() }, 503);
  }

  return json(result.value);
}
