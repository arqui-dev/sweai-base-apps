import { describe, expect, it, vi } from "vitest";

/**
 * Credential-shaped values are assembled at runtime rather than written as
 * literals. A test needs strings that do *not* look like placeholders in order
 * to prove the negative case, and a literal "sk_live_..." in a source file is
 * both a secret scanner finding and something a reader has to stop and verify
 * is fake. Never paste a real credential here, not even a truncated one.
 */
const fakeKey = (prefix: string): string => `${prefix}_${"x7Qa".repeat(6)}`;

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
  // Empty at boot, so env.ts recorded the name and substituted random bytes.
  unconfiguredServerVars: ["ADMIN_API_TOKEN"],
}));
vi.mock("@/env.public", () => ({
  publicEnv: {
    NEXT_PUBLIC_SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"x7Qa".repeat(6)}`,
    NEXT_PUBLIC_SANITY_PROJECT_ID: "placeholder",
  },
  unconfiguredPublicVars: [],
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
      "https://REPLACE.supabase.co",
      "https://unconfigured.supabase.co",
      "sb_publishable_unconfigured",
    ]) {
      expect(looksPlaceholder(value), value).toBe(true);
    }
  });

  it("leaves configured credentials alone", () => {
    for (const value of [
      fakeKey("sb_publishable"),
      fakeKey("sk_live"),
      fakeKey("whsec"),
      fakeKey("re"),
      "https://abcdefghijklmnopqrst.supabase.co",
    ]) {
      expect(looksPlaceholder(value), value).toBe(false);
    }
  });
});

describe("placeholderEnvVars", () => {
  it("merges the empty-at-boot list with the ones matching a placeholder", () => {
    expect([...placeholderEnvVars()]).toStrictEqual([
      // recorded as empty at boot, so its random value is invisible to a pattern
      "ADMIN_API_TOKEN",
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
    expect(hint).toContain("ADMIN_API_TOKEN");
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
      unconfiguredServerVars: [],
    }));
    vi.doMock("@/env.public", () => ({
      publicEnv: {
        NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
        NEXT_PUBLIC_SANITY_PROJECT_ID: "x",
      },
      unconfiguredPublicVars: [],
    }));
    const prod = await import("./config-check");
    expect(prod.setupHint()).toBeUndefined();
  });
});
