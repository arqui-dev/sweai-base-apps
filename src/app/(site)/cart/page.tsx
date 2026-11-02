import { CartClient } from "./cart-client";
import { section } from "@/components/ui/styles";
import { COFFEE } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const user = await getCurrentUser();

  return (
    <div className={`${section()} max-w-xl`}>
      <h1 className="mb-2 text-3xl">Cart</h1>
      <p className="mb-8 text-sm text-muted">
        One line item, because there is one thing to buy. The quantity is a tip: any amount above
        one coffee grants the same premium access.
      </p>
      <CartClient
        unitAmount={COFFEE.unitAmount}
        currency={COFFEE.currency}
        needsEmail={!user}
      />
    </div>
  );
}
