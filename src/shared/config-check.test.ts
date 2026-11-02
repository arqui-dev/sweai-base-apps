import { describe, expect, it, vi } from "vitest";

vi.mock("@/env", () => ({
  env: {
    NODE_ENV: "development",
    SUPABASE_SECRET_KEY: "sb_secret_PLACEHOLDER_REPLACE_ME",
    STRIPE_SECRET_KEY: "sk_test_placeholder",
    STRIPE_WEBHOOK_SECRET: "whsec_real_looking_value_here",
    RESEND_API_KEY: "re_placeholder",
    ADMIN_API_TOKEN: "a-real-admin-token-value",
    NEWSLETTER_SECRET: "a-real-newsletter-secret-value",
  },
}));
vi.mock("@/env.public", () => ({
  publicEnv: {
    NEXT_PUBLIC_SUPABASE_URL: "https://tvqschzxuflwjrplfhri.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_YM3sAUIgqHicvyzS2SwvRw",
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

  it("leaves real credentials alone", () => {
    for (const value of [
      "sb_publishable_YM3sAUIgqHicvyzS2SwvRw",
      "sk_live_51abcdefghijklmnop",
      "whsec_abc123def456",
      "re_ABc123XyZ789",
      "https://tvqschzxuflwjrplfhri.supabase.co",
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
