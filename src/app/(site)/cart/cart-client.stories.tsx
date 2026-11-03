import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CartClient } from "./cart-client";

const meta = {
  title: "Commerce/CartClient",
  component: CartClient,
  args: { unitAmount: 500, currency: "usd", needsEmail: false },
} satisfies Meta<typeof CartClient>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Signed in: the receipt address is already known. */
export const SignedIn: Story = {};

/** Anonymous: an address is required before checkout can start. */
export const NeedsEmail: Story = { args: { needsEmail: true } };

/** Currency and amount come from server config, never from the client. */
export const Brazilian: Story = { args: { unitAmount: 2500, currency: "brl" } };
