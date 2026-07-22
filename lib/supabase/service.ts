import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Full-access client for server-only code (uploads, admin writes, signed
 * URLs). Uses the secret key, which must never reach the browser.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );
}
