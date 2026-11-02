"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/env.public";

export const createSupabaseBrowserClient = () =>
  createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
