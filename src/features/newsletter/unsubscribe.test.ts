import { describe, expect, it, vi } from "vitest";

vi.mock("@/env", () => ({ env: { NEWSLETTER_SECRET: "test-secret-at-least-32-chars-long" } }));
vi.mock("@/env.public", () => ({
  publicEnv: { NEXT_PUBLIC_SITE_URL: "https://example.test" },
}));
vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: {} }));

const { signEmail, unsubscribeUrl, verifyEmailToken } = await import("./unsubscribe");

describe("unsubscribe tokens", () => {
  it("accepts the token it just issued", () => {
    const email = "reader@example.com";
    expect(verifyEmailToken(email, signEmail(email))).toBe(true);
  });

  it("rejects a token issued for a different address", () => {
    expect(verifyEmailToken("victim@example.com", signEmail("attacker@example.com"))).toBe(false);
  });

  it("rejects an empty or truncated token", () => {
    const token = signEmail("reader@example.com");
    expect(verifyEmailToken("reader@example.com", "")).toBe(false);
    expect(verifyEmailToken("reader@example.com", token.slice(0, -1))).toBe(false);
  });

  it("treats case and surrounding space as the same address", () => {
    const token = signEmail("reader@example.com");
    expect(verifyEmailToken("  Reader@Example.COM ", token)).toBe(true);
  });

  it("builds an absolute link carrying the address and its signature", () => {
    const url = new URL(unsubscribeUrl("Reader@Example.com"));
    expect(url.origin).toBe("https://example.test");
    expect(url.pathname).toBe("/unsubscribe");
    expect(url.searchParams.get("e")).toBe("reader@example.com");
    expect(verifyEmailToken("reader@example.com", url.searchParams.get("t") ?? "")).toBe(true);
  });
});
