import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * An empty secret must fail closed. The tempting shortcut, substituting the
 * placeholder value committed for CI, would publish the admin token to anyone
 * who can read this repository: a request carrying
 * `Authorization: Bearer placeholder-admin-token-32-chars` would authenticate.
 * Empty secrets therefore get random bytes, which no caller can guess.
 */

const SECRET_KEYS = [
  "SUPABASE_SECRET_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "ADMIN_API_TOKEN",
  "NEWSLETTER_SECRET",
  "RESEND_FROM",
] as const;

const PUBLIC_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
] as const;

/** Loads env.ts fresh with every listed variable set to the empty string. */
async function bootWithEmptyVars() {
  vi.resetModules();
  for (const key of [...SECRET_KEYS, ...PUBLIC_KEYS]) process.env[key] = "";
  delete process.env.NEXT_PUBLIC_VERCEL_URL;
  return {
    server: await import("./env"),
    client: await import("./env.public"),
  };
}

beforeEach(() => {
  vi.resetModules();
});

describe("booting with every variable empty", () => {
  it("does not throw, so the application deploys before any account exists", async () => {
    await expect(bootWithEmptyVars()).resolves.toBeDefined();
  });

  it("records every empty variable so the 503 hint can name it", async () => {
    const { server, client } = await bootWithEmptyVars();
    for (const key of SECRET_KEYS) {
      expect(server.unconfiguredServerVars, key).toContain(key);
    }
    for (const key of ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_SUPABASE_URL"]) {
      expect(client.unconfiguredPublicVars, key).toContain(key);
    }
  });

  it("never substitutes a value committed to this repository for a secret", async () => {
    const { server } = await bootWithEmptyVars();
    const committed = [
      "placeholder-admin-token-32-chars",
      "placeholder-newsletter-secret-32-chars",
      "sk_test_placeholder",
      "whsec_placeholder",
      "sb_secret_placeholder",
      "re_placeholder",
    ];
    for (const value of [
      server.env.ADMIN_API_TOKEN,
      server.env.NEWSLETTER_SECRET,
      server.env.STRIPE_SECRET_KEY,
      server.env.STRIPE_WEBHOOK_SECRET,
      server.env.SUPABASE_SECRET_KEY,
      server.env.RESEND_API_KEY,
    ]) {
      expect(committed, value).not.toContain(value);
    }
  });

  it("gives the admin token enough entropy that a guess cannot authenticate", async () => {
    const { server } = await bootWithEmptyVars();
    expect(server.env.ADMIN_API_TOKEN.length).toBeGreaterThanOrEqual(16);
    expect(server.env.NEWSLETTER_SECRET.length).toBeGreaterThanOrEqual(32);
  });

  it("picks a different secret on every boot, so nothing is predictable", async () => {
    const first = (await bootWithEmptyVars()).server.env.ADMIN_API_TOKEN;
    const second = (await bootWithEmptyVars()).server.env.ADMIN_API_TOKEN;
    expect(first).not.toBe(second);
  });

  it("keeps the shapes other code depends on", async () => {
    const { server, client } = await bootWithEmptyVars();
    expect(server.env.STRIPE_SECRET_KEY.startsWith("sk_")).toBe(true);
    expect(server.env.STRIPE_WEBHOOK_SECRET.startsWith("whsec_")).toBe(true);
    expect(server.env.SUPABASE_SECRET_KEY.startsWith("sb_secret_")).toBe(true);
    expect(server.env.COFFEE_UNIT_AMOUNT).toBe(500);
    expect(() => new URL(client.publicEnv.NEXT_PUBLIC_SITE_URL)).not.toThrow();
    expect(() => new URL(client.publicEnv.NEXT_PUBLIC_SUPABASE_URL)).not.toThrow();
    expect(client.publicEnv.NEXT_PUBLIC_SANITY_DATASET).toBe("production");
  });

  it("derives the site URL from the Vercel deployment when it is not set", async () => {
    vi.resetModules();
    for (const key of PUBLIC_KEYS) process.env[key] = "";
    process.env.NEXT_PUBLIC_VERCEL_URL = "hire-service-abc123.vercel.app";
    const client = await import("./env.public");
    expect(client.publicEnv.NEXT_PUBLIC_SITE_URL).toBe("https://hire-service-abc123.vercel.app");
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
  });

  it("still rejects a value that is set but malformed", async () => {
    vi.resetModules();
    for (const key of SECRET_KEYS) process.env[key] = "";
    // A publishable key pasted into the secret slot is a real mistake, not an
    // unset variable, and must still stop the boot.
    process.env.SUPABASE_SECRET_KEY = "sb_publishable_wrong_slot";
    await expect(import("./env")).rejects.toThrow(/Invalid server environment/);
    process.env.SUPABASE_SECRET_KEY = "";
  });
});
