import Stripe from "stripe";
import { env } from "@/env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  // Pinned so a Stripe-side API bump cannot change webhook payload shapes
  // without a deliberate commit here.
  apiVersion: "2026-10-28.endive",
  typescript: true,
});

export const COFFEE = {
  unitAmount: env.COFFEE_UNIT_AMOUNT,
  currency: env.COFFEE_CURRENCY,
} as const;
