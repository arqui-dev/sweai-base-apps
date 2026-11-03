import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CoffeeButton } from "./coffee-button";

/**
 * Posts to `/api/checkout` and redirects to Stripe. In Storybook there is no
 * route handler, so pressing it surfaces the error state, which is itself a
 * state worth reviewing.
 */
const meta = {
  title: "Commerce/CoffeeButton",
  component: CoffeeButton,
  args: { needsEmail: false },
} satisfies Meta<typeof CoffeeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {};

export const NeedsEmail: Story = {
  args: { needsEmail: true },
  parameters: {
    docs: {
      description: {
        story: "The button stays disabled until the address contains an @.",
      },
    },
  },
};

export const CustomLabel: Story = {
  args: { needsEmail: false, children: "Unlock for $5.00" },
};

export const MultipleCoffees: Story = { args: { quantity: 4, needsEmail: false } };
