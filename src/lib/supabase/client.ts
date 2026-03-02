"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let singleton: SupabaseClient | null | undefined;

export function getSupabaseBrowserClient() {
  if (singleton !== undefined) {
    return singleton;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    singleton = null;
    return singleton;
  }

  singleton = createClient(url, anonKey);
  return singleton;
}

