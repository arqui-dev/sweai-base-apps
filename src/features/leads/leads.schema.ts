import { z } from "zod";

/**
 * One table backs both the waitlist and the early-access list. The list name is
 * data, not a schema difference, so a new capture page needs no migration.
 */
export const LEAD_LISTS = ["waitlist", "early-access"] as const;
export type LeadList = (typeof LEAD_LISTS)[number];

export const leadInput = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().min(1).max(80).optional(),
  company: z.string().trim().max(120).optional(),
  /** Free text from the capture form. Rendered as text, never as HTML. */
  note: z.string().trim().max(500).optional(),
  list: z.enum(LEAD_LISTS),
});

export type LeadInput = z.infer<typeof leadInput>;
