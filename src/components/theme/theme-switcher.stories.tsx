import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ThemeSwitcher } from "./theme-switcher";

/**
 * In the app this writes a cookie so the server renders the same theme on the
 * next request. Here it only sets the attribute, because Storybook has no
 * server; use the toolbar to drive the surrounding theme.
 */
const meta = {
  title: "Navigation/ThemeSwitcher",
  component: ThemeSwitcher,
  args: { current: "minimalist" },
} satisfies Meta<typeof ThemeSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const StartingOnTerminal: Story = { args: { current: "terminal" } };
