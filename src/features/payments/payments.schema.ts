import { z } from "zod";

export const checkoutInput = z.object({
  /** Number of coffees. The cart page is the only caller that sends > 1. */
  quantity: z.coerce.number().int().min(1).max(20).default(1),
  /** Required when the buyer is not signed in, so the grant has a subject. */
  email: z.string().trim().toLowerCase().email().max(254).optional(),
  /** Post defaults to a slug the buyer wanted to read, used for the redirect. */
  slug: z.string().trim().max(120).regex(/^[a-z0-9-]*$/).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutInput>;
