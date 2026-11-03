import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NotFoundContent } from "./not-found-content";

/** Shared by the root `not-found.tsx` and the one inside the `(site)` group. */
const meta = {
  title: "Feedback/NotFoundContent",
  component: NotFoundContent,
} satisfies Meta<typeof NotFoundContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
