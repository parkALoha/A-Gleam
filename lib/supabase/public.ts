import { createClient } from "@supabase/supabase-js";

/**
 * Lightweight client for anonymous, public reads (product catalog, shop
 * settings). No cookies/session handling needed — RLS already restricts
 * what this key can see (e.g. only published products).
 */
export function createPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
}
