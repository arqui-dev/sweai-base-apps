"use client";

import { useState } from "react";
import { btn, input, label } from "@/components/ui/styles";

type Field = "name" | "company" | "note";

type Props = {
  /** Route handler that owns the write. Keeps this component list-agnostic. */
  endpoint: "/api/newsletter" | "/api/leads";
  /** Extra body keys the endpoint needs, e.g. `{ list: "waitlist" }`. */
  payload?: Record<string, string>;
  fields?: readonly Field[];
  cta?: string;
};

/**
 * One form behind the newsletter, the waitlist and the early-access page. The
 * difference between them is the endpoint and which optional fields show.
 */
export function EmailCapture({ endpoint, payload = {}, fields = [], cta = "Subscribe" }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");

    const form = new FormData(event.currentTarget);
    const body: Record<string, string> = { ...payload };
    for (const [key, value] of form.entries()) {
      if (typeof value === "string" && value.trim()) body[key] = value.trim();
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
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
      <p role="status" className="text-sm text-accent">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3" noValidate={false}>
      <div>
        <label htmlFor={`${endpoint}-email`} className={label()}>
          Email
        </label>
        <input
          id={`${endpoint}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className={input()}
        />
      </div>

      {fields.includes("name") && (
        <div>
          <label htmlFor={`${endpoint}-name`} className={label()}>
            Name
          </label>
          <input id={`${endpoint}-name`} name="name" autoComplete="name" className={input()} />
        </div>
      )}

      {fields.includes("company") && (
        <div>
          <label htmlFor={`${endpoint}-company`} className={label()}>
            Company
          </label>
          <input id={`${endpoint}-company`} name="company" className={input()} />
        </div>
      )}

      {fields.includes("note") && (
        <div>
          <label htmlFor={`${endpoint}-note`} className={label()}>
            What do you need built?
          </label>
          <textarea id={`${endpoint}-note`} name="note" rows={3} className={input()} />
        </div>
      )}

      <button type="submit" disabled={state === "sending"} className={btn()}>
        {state === "sending" ? "Sending..." : cta}
      </button>

      {state === "error" && (
        <p role="alert" className="text-sm text-accent">
          {message}
        </p>
      )}
    </form>
  );
}
