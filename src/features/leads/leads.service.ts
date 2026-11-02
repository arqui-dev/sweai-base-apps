import { MAIL_FROM, resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/shared/logger";
import { reasonOf } from "@/shared/reason";
import { type Result, err, ok } from "@/shared/result";
import type { LeadInput } from "./leads.schema";

export async function captureLead(
  input: LeadInput,
): Promise<Result<{ position: number }, "STORAGE_ERROR">> {
  const { error } = await supabaseAdmin.from("leads").upsert(
    {
      email: input.email,
      name: input.name ?? null,
      company: input.company ?? null,
      note: input.note ?? null,
      list: input.list,
    },
    { onConflict: "email,list" },
  );

  if (error) {
    logger.error("lead upsert failed", { list: input.list, reason: error.message });
    return err("STORAGE_ERROR");
  }

  const { count, error: countError } = await supabaseAdmin
    .from("leads")
    .select("email", { count: "exact", head: true })
    .eq("list", input.list);

  if (countError) {
    logger.warn("lead count failed", { reason: countError.message });
  }

  await resend.emails
    .send({
      from: MAIL_FROM,
      to: input.email,
      subject: input.list === "waitlist" ? "You are on the waitlist" : "Early access confirmed",
      html: `<p>Hi ${input.name ?? "there"},</p><p>You are number ${count ?? 1} on the ${input.list} list. We mail you when your slot opens.</p>`,
    })
    .catch((error: unknown) => {
      logger.error("lead confirmation mail failed", {
        reason: reasonOf(error),
      });
    });

  return ok({ position: count ?? 1 });
}
