import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Link from "next/link";
import { SiteMenu } from "./site-menu";
import { btn } from "./ui/styles";

/**
 * The hamburger menu. Built on the Popover API, so the panel only appears
 * after a real click: Storybook cannot force it open with a prop, and that is
 * the point. Use the toolbar to check every theme.
 */
const meta = {
  title: "Navigation/SiteMenu",
  component: SiteMenu,
  parameters: {
    docs: {
      description: {
        component:
          "Click the hamburger to open. Escape and clicking outside both close it, handled by the browser rather than by an effect.",
      },
    },
  },
} satisfies Meta<typeof SiteMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Anonymous: Story = {
  args: {
    account: (
      <Link href="/login" className={btn("ghost")}>
        Sign in
      </Link>
    ),
  },
};

export const SignedIn: Story = {
  args: {
    account: (
      <Link href="/profile" className="hover:text-accent text-sm">
        reader@example.com
      </Link>
    ),
  },
};
