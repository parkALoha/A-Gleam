import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Verifies the admin is logged in by asking Supabase Auth directly
 * (not just decoding the cookie) — the "secure" check every admin
 * Server Action / Route Handler must call before mutating data.
 */
export async function getAdminSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  return user;
}
