import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmailCapture } from "./email-capture";

/**
 * One form behind the newsletter, the waitlist and the early-access page. The
 * difference between them is the endpoint and which optional fields show, so
 * these stories are the whole surface of all three pages.
 */
const meta = {
  title: "Forms/EmailCapture",
  component: EmailCapture,
  args: { endpoint: "/api/newsletter" },
} satisfies Meta<typeof EmailCapture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Newsletter: Story = {
  args: { payload: { source: "subscribe" }, fields: ["name"], cta: "Subscribe" },
};

export const Waitlist: Story = {
  args: {
    endpoint: "/api/leads",
    payload: { list: "waitlist" },
    fields: ["name", "company", "note"],
    cta: "Join the waitlist",
  },
};

/** Email only. The minimum a capture page can ask for, and the default. */
export const EmailOnly: Story = { args: { cta: "Notify me" } };
