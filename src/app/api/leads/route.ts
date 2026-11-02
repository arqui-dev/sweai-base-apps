import { leadInput } from "@/features/leads/leads.schema";
import { captureLead } from "@/features/leads/leads.service";
import { allow, clientKey } from "@/lib/rate-limit";
import { setupHint } from "@/shared/config-check";
import { json, parseBody } from "@/shared/http";
import { logger } from "@/shared/logger";

export async function POST(request: Request): Promise<Response> {
  if (!allow(clientKey(request, "leads"))) {
    logger.warn("rate limit rejected", { scope: "leads" });
    return json({ message: "Too many requests. Try again in a minute." }, 429);
  }

  const parsed = await parseBody(request, leadInput);
  if (!parsed.ok) {
    return json({ message: parsed.error.message, fields: parsed.error.fields }, parsed.error.status);
  }

  const result = await captureLead(parsed.value);
  if (!result.ok) {
    return json({ message: "Could not save your details.", hint: setupHint() }, 503);
  }

  return json({ message: `You are number ${result.value.position} in line.` });
}
