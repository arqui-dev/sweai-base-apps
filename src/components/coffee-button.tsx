"use client";

import { useState } from "react";
import { btn, input } from "@/components/ui/styles";

type Props = {
  quantity?: number;
  slug?: string;
  /** Anonymous buyers need somewhere to send the receipt. */
  needsEmail: boolean;
  children?: React.ReactNode;
};

/** Single-payment button. Redirects to Stripe Checkout, no card form here. */
export function CoffeeButton({ quantity = 1, slug, needsEmail, children }: Props) {
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function buy() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quantity, slug, email: needsEmail ? email : undefined }),
      });
      const data: { url?: string; message?: string } = await response.json();
      if (!response.ok || !data.url) {
        setError(data.message ?? "Could not start checkout.");
        setBusy(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Network error. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3">
      {needsEmail && (
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email for the receipt"
          aria-label="Email for the receipt"
          className={input()}
        />
      )}
      <button
        type="button"
        onClick={buy}
        disabled={busy || (needsEmail && !email.includes("@"))}
        className={btn()}
      >
        {busy ? "Opening checkout..." : (children ?? "Buy me a coffee")}
      </button>
      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
