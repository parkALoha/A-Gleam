import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

// A singleton, not a fresh client per call. A dozen components each call
// this independently — a fresh GoTrueClient per call means several
// co-exist in the same tab (e.g. Header's account check + a page's own
// auth form), and they race to parse any auth token in the URL hash (like
// a password-recovery link). Only one instance "wins" that parse, so
// every other caller's onAuthStateChange listener would silently never
// fire for it. One shared instance means one hash parse, observed
// consistently by every listener.
export function createBrowserSupabaseClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
  }
  return client;
}
