import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { btn, card, input, label, section } from "./styles";

/**
 * The styling primitives every page is built from. They are class-string
 * helpers rather than wrapper components so the same styles apply to a
 * `<button>`, an `<a>` and a Next `<Link>` without a polymorphic `as` prop.
 *
 * Switch themes in the toolbar: no helper names a colour, so all five presets
 * come from the same strings. A primitive that looks right in one theme and
 * wrong in another is reaching past its tokens.
 */
const meta = {
  title: "Foundations/Primitives",
  parameters: {
    docs: {
      description: {
        component:
          "Reach for these before writing new classes. New UI composes primitives; it does not restate them.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Buttons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className={btn()}>
        Primary
      </button>
      <button type="button" className={btn("ghost")}>
        Ghost
      </button>
      <button type="button" disabled className={btn()}>
        Disabled
      </button>
      <a href="#primitives" className={btn("ghost")}>
        Anchor, same styles
      </a>
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div className="grid max-w-xl gap-4">
      <div className={card()}>
        <h2 className="mb-2 text-xl">Surface, border, radius, shadow</h2>
        <p className="text-muted text-sm">
          Every one of those four is a theme token, so brutalist gets a 3px black edge and a hard
          offset shadow from the same class string that gives minimalist a 1px hairline.
        </p>
      </div>
    </div>
  ),
};

export const Field: Story = {
  render: () => (
    <div className="grid max-w-sm gap-4">
      <div>
        <label htmlFor="primitives-email" className={label()}>
          Email
        </label>
        <input
          id="primitives-email"
          type="email"
          placeholder="you@company.com"
          className={input()}
        />
      </div>
      <div>
        <label htmlFor="primitives-note" className={label()}>
          What do you need built?
        </label>
        <textarea id="primitives-note" rows={3} className={input()} />
      </div>
    </div>
  ),
};

export const Section: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className={section()}>
      <h1 className="mb-2 text-3xl">Section wrapper</h1>
      <p className="text-muted text-sm">
        Centres content at the page measure and carries the vertical rhythm every route uses.
      </p>
    </div>
  ),
};
