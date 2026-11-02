import { describe, expect, it, vi } from "vitest";

/**
 * Credential-shaped values are assembled at runtime rather than written as
 * literals. A test needs strings that do *not* look like placeholders in order
 * to prove the negative case, and a literal "sk_live_..." in a source file is
 * both a secret scanner finding and something a reader has to stop and verify
 * is fake. Building them from parts removes the token without weakening the
 * assertion. Never paste a real credential here, not even a truncated one.
 */
const fakeKey = (prefix: string): string => `${prefix}_${"x7Qa".repeat(6)}`;
const fakeProjectUrl = "https://abcdefghijklmnopqrst.supabase.co";

vi.mock("@/env", () => ({
  env: {
    NODE_ENV: "development",
    SUPABASE_SECRET_KEY: "sb_secret_PLACEHOLDER_REPLACE_ME",
    STRIPE_SECRET_KEY: "sk_test_placeholder",
    STRIPE_WEBHOOK_SECRET: `whsec_${"x7Qa".repeat(6)}`,
    RESEND_API_KEY: "re_placeholder",
    ADMIN_API_TOKEN: "an-admin-token-that-is-set",
    NEWSLETTER_SECRET: "a-newsletter-secret-that-is-set",
  },
}));
vi.mock("@/env.public", () => ({
  publicEnv: {
    NEXT_PUBLIC_SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"x7Qa".repeat(6)}`,
    NEXT_PUBLIC_SANITY_PROJECT_ID: "placeholder",
  },
}));

const { looksPlaceholder, placeholderEnvVars, setupHint } = await import("./config-check");

describe("looksPlaceholder", () => {
  it("catches the placeholder spellings this repo actually uses", () => {
    for (const value of [
      "placeholder",
      "sk_test_placeholder",
      "sb_secret_PLACEHOLDER_REPLACE_ME",
      "REPLACE",
      "re_placeholder",
      // The spelling a fresh clone gets from .env.example.
      "https://REPLACE.supabase.co",
    ]) {
      expect(looksPlaceholder(value)).toBe(true);
    }
  });

  it("leaves configured credentials alone", () => {
    for (const value of [
      fakeKey("sb_publishable"),
      fakeKey("sk_live"),
      fakeKey("whsec"),
      fakeKey("re"),
      fakeProjectUrl,
    ]) {
      expect(looksPlaceholder(value)).toBe(false);
    }
  });
});

describe("placeholderEnvVars", () => {
  it("names only the unconfigured variables", () => {
    expect([...placeholderEnvVars()].sort()).toStrictEqual([
      "NEXT_PUBLIC_SANITY_PROJECT_ID",
      "RESEND_API_KEY",
      "STRIPE_SECRET_KEY",
      "SUPABASE_SECRET_KEY",
    ]);
  });
});

describe("setupHint", () => {
  it("names the pending variables outside production", () => {
    const hint = setupHint();
    expect(hint).toContain("SUPABASE_SECRET_KEY");
    expect(hint).toContain("STRIPE_SECRET_KEY");
  });

  it("says nothing in production, so a caller learns no config detail", async () => {
    vi.resetModules();
    vi.doMock("@/env", () => ({
      env: {
        NODE_ENV: "production",
        SUPABASE_SECRET_KEY: "sb_secret_placeholder",
        STRIPE_SECRET_KEY: "sk_test_placeholder",
        STRIPE_WEBHOOK_SECRET: "whsec_placeholder",
        RESEND_API_KEY: "re_placeholder",
        ADMIN_API_TOKEN: "placeholder",
        NEWSLETTER_SECRET: "placeholder",
      },
    }));
    const prod = await import("./config-check");
    expect(prod.setupHint()).toBeUndefined();
  });
});
