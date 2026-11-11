import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * One unauthenticated request chooses both the address and the name, so an
 * anonymous caller must not be able to put a person who unsubscribed back on
 * the list. These tests pin that, and pin that the refusal is indistinguishable
 * from a normal subscribe so the endpoint is not an enumeration oracle.
 */

const upsert = vi.fn(() => Promise.resolve({ error: null }));
let existingRow: { email: string; unsubscribed_at: string | null } | null = null;

vi.mock("@/env", () => ({
  env: { RESEND_FROM: "test <t@example.invalid>", RESEND_API_KEY: "re_test" },
}));
vi.mock("@/env.public", () => ({
  publicEnv: { NEXT_PUBLIC_SITE_URL: "https://example.test" },
}));
vi.mock("@/lib/resend", () => ({
  resend: { emails: { send: vi.fn(() => Promise.resolve({})) }, contacts: { create: vi.fn() } },
  MAIL_FROM: "test <t@example.invalid>",
}));
vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: () => Promise.resolve({ data: existingRow, error: null }) }),
      }),
      upsert,
    }),
  },
}));

const { subscribe } = await import("./newsletter.service");

beforeEach(() => {
  upsert.mockClear();
  existingRow = null;
});

describe("subscribe", () => {
  it("stores a new address", async () => {
    const r = await subscribe({ email: "new@example.com", source: "subscribe" });
    expect(r.ok).toBe(true);
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it("refuses to resurrect an opted-out address for an anonymous caller", async () => {
    existingRow = { email: "gone@example.com", unsubscribed_at: "2026-01-01T00:00:00Z" };
    const r = await subscribe({ email: "gone@example.com", source: "subscribe" });
    expect(r.ok).toBe(true);
    expect(upsert, "no write, so unsubscribed_at stays set").not.toHaveBeenCalled();
  });

  it("allows the owner of the mailbox to resubscribe", async () => {
    existingRow = { email: "back@example.com", unsubscribed_at: "2026-01-01T00:00:00Z" };
    const r = await subscribe(
      { email: "back@example.com", source: "profile" },
      { allowResubscribe: true },
    );
    expect(r.ok).toBe(true);
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it("reports the same shape whether the address was known or not", async () => {
    const unknown = await subscribe({ email: "a@example.com", source: "subscribe" });
    existingRow = { email: "b@example.com", unsubscribed_at: null };
    const known = await subscribe({ email: "b@example.com", source: "subscribe" });
    expect(unknown.ok).toBe(true);
    expect(known.ok).toBe(true);
  });
});
