"use client";

import Link from "next/link";
import { useState } from "react";
import { btn } from "@/components/ui/styles";

/**
 * The confirmation lives behind a button on purpose. The page is reached by a
 * GET from an inbox, and a GET that unsubscribes would fire on every link
 * prefetch and security scan.
 */
export function UnsubscribeConfirm({ email, token }: { email: string; token: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function confirm() {
    setState("sending");
    const url = `/api/newsletter/unsubscribe?e=${encodeURIComponent(email)}&t=${encodeURIComponent(token)}`;

    try {
      const response = await fetch(url, { method: "POST" });
      const data: { message?: string } = await response.json();
      setMessage(data.message ?? (response.ok ? "Done." : "Something went wrong."));
      setState(response.ok ? "done" : "error");
    } catch {
      setMessage("Network error. Try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="grid gap-4">
        <p role="status" className="text-sm text-accent">
          {message}
        </p>
        <p className="text-sm text-muted">
          Changed your mind?{" "}
          <Link href="/subscribe" className="text-accent underline">
            Subscribe again
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <button type="button" onClick={confirm} disabled={state === "sending"} className={btn()}>
        {state === "sending" ? "Updating..." : "Unsubscribe me"}
      </button>
      <Link href="/blog" className={btn("ghost")}>
        Keep my subscription
      </Link>
      {state === "error" && (
        <p role="alert" className="text-sm text-accent">
          {message}
        </p>
      )}
    </div>
  );
}
