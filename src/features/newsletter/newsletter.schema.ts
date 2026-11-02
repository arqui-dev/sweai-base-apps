import { z } from "zod";

export const subscribeInput = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().min(1).max(80).optional(),
  // Which page captured the address. Used for attribution, never for routing.
  source: z.enum(["landing", "subscribe", "blog", "profile"]).default("subscribe"),
});

export type SubscribeInput = z.infer<typeof subscribeInput>;

export const campaignInput = z.object({
  subject: z.string().trim().min(3).max(120),
  html: z.string().min(10),
  /** Cap per invocation so a typo cannot mail the whole list twice. */
  limit: z.coerce.number().int().min(1).max(500).default(100),
});
