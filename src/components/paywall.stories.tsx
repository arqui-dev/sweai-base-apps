import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Paywall } from "./paywall";

/**
 * Rendered in place of a premium body. It carries no part of the locked post,
 * which is the invariant `posts.gate.ts` and `assertNoLeak` protect.
 */
const meta = {
  title: "Content/Paywall",
  component: Paywall,
  args: { slug: "the-paywall-is-a-groq-query", priceLabel: "$5.00", isSignedIn: false },
} satisfies Meta<typeof Paywall>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Anonymous: offers guest checkout and a route back for someone who paid. */
export const Anonymous: Story = {};

/** Signed in: no address needed, and no restore-access hint. */
export const SignedIn: Story = { args: { isSignedIn: true } };

export const BrazilianPricing: Story = { args: { priceLabel: "R$ 25,00" } };
