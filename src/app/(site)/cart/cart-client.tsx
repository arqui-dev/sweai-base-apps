"use client";

import { useState } from "react";
import { CoffeeButton } from "@/components/coffee-button";
import { btn, card } from "@/components/ui/styles";
import { formatMoney } from "@/lib/money";

const MAX_QUANTITY = 20;

/**
 * ponytail: quantity in component state, no cart store and no persistence. A
 * single-line-item cart has nothing to sync. Reach for a server-side cart when
 * a second product appears.
 */
export function CartClient({
  unitAmount,
  currency,
  needsEmail,
}: {
  unitAmount: number;
  currency: string;
  needsEmail: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const step = (delta: number) =>
    setQuantity((current) => Math.min(MAX_QUANTITY, Math.max(1, current + delta)));

  return (
    <div className={card()}>
      <div className="flex items-center justify-between gap-4 border-b-(length:--border-width) border-border pb-5">
        <div>
          <p className="text-base">A coffee</p>
          <p className="text-sm text-muted">
            {formatMoney(unitAmount, currency)} each, unlocks all premium posts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={quantity <= 1}
            aria-label="Remove one coffee"
            className={btn("ghost")}
          >
            -
          </button>
          <output aria-label="Quantity" className="w-8 text-center text-base">
            {quantity}
          </output>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={quantity >= MAX_QUANTITY}
            aria-label="Add one coffee"
            className={btn("ghost")}
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 py-5">
        <span className="text-muted text-sm">Total</span>
        <span className="font-display text-2xl">
          {formatMoney(unitAmount * quantity, currency)}
        </span>
      </div>

      <CoffeeButton quantity={quantity} needsEmail={needsEmail}>
        Pay {formatMoney(unitAmount * quantity, currency)}
      </CoffeeButton>

      <p className="mt-4 text-xs text-muted">
        The server rebuilds this total from its own price before charging, so editing it here
        changes nothing.
      </p>
    </div>
  );
}
