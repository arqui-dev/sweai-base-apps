import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/shared/safe-url";
import { logger } from "@/shared/logger";

/** Exchanges the magic-link code for a session cookie, then returns the user. */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // safeNextPath, not a prefix check: "//evil.test" and "/\\evil.test" both
  // start with "/" and both resolve off-origin through new URL().
  const destination = safeNextPath(url.searchParams.get("next"), "/profile");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing-code", url.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logger.warn("code exchange failed", { reason: error.message });
    return NextResponse.redirect(new URL("/login?error=expired-link", url.origin));
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
