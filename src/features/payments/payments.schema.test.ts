import { describe, expect, it } from "vitest";
import { checkoutInput } from "./payments.schema";

describe("checkoutInput", () => {
  it("defaults to one coffee", () => {
    const parsed = checkoutInput.parse({});
    expect(parsed.quantity).toBe(1);
  });

  it("rejects a quantity above the cap", () => {
    expect(checkoutInput.safeParse({ quantity: 21 }).success).toBe(false);
  });

  it("rejects a quantity below one, including negatives", () => {
    expect(checkoutInput.safeParse({ quantity: 0 }).success).toBe(false);
    expect(checkoutInput.safeParse({ quantity: -5 }).success).toBe(false);
  });

  it("ignores any price the client tries to send", () => {
    const parsed = checkoutInput.parse({ quantity: 2, unitAmount: 1, amount: 1 });
    expect(parsed).toStrictEqual({ quantity: 2 });
  });

  it("lowercases the receipt email", () => {
    const parsed = checkoutInput.parse({ email: "  Buyer@Example.COM " });
    expect(parsed.email).toBe("buyer@example.com");
  });

  it("rejects a slug that could redirect off site", () => {
    expect(checkoutInput.safeParse({ slug: "../../evil" }).success).toBe(false);
    expect(checkoutInput.safeParse({ slug: "https://evil.test" }).success).toBe(false);
  });
});
