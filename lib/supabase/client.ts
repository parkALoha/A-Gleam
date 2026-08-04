import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

// A singleton, not a fresh client per call. A dozen components each call
// this independently — a fresh GoTrueClient per call means several
// co-exist in the same tab (e.g. Header's account check + a page's own
// auth form), each with its own separate in-memory auth state. Signing in
// or out through one instance would never notify another instance's
// onAuthStateChange listeners. One shared instance means one source of
// truth, observed consistently by every listener.
export function createBrowserSupabaseClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          // The default (true) makes the SDK silently auto-exchange any
          // ?code= or #access_token= in the URL the instant this client is
          // constructed — which happens as soon as Header mounts on every
          // page. Password reset is OTP-based (a code typed back into the
          // form, not a link), and OAuth sign-in is exchanged server-side
          // in /auth/callback, so nothing in this app relies on the
          // browser client auto-detecting tokens from the URL. Left off
          // rather than re-enabled since there's no upside to it.
          detectSessionInUrl: false,
        },
      },
    );
  }
  return client;
}
