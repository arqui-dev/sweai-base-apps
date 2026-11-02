"use client";

import { useState } from "react";
import { publicEnv } from "@/env.public";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { btn, input, label } from "@/components/ui/styles";

export function LoginForm({ next }: { next: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");

    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    const supabase = createSupabaseBrowserClient();
    const redirect = new URL("/auth/callback", publicEnv.NEXT_PUBLIC_SITE_URL);
    redirect.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirect.toString() },
    });

    if (error) {
      setMessage(error.message);
      setState("error");
      return;
    }
    setMessage(`Link sent to ${email}. It is valid for one hour.`);
    setState("sent");
  }

  if (state === "sent") {
    return (
      <p role="status" className="text-sm text-accent">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div>
        <label htmlFor="login-email" className={label()}>
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          className={input()}
        />
      </div>
      <button type="submit" disabled={state === "sending"} className={btn()}>
        {state === "sending" ? "Sending..." : "Email me a link"}
      </button>
      {state === "error" && (
        <p role="alert" className="text-sm text-accent">
          {message}
        </p>
      )}
    </form>
  );
}
