import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Verifies the caller is logged in AND flagged `is_admin` in `profiles`
 * (not just "logged in" — that used to be the whole check, which becomes a
 * hole the moment customers can create accounts too) — the "secure" check
 * every admin Server Action / Route Handler must call before mutating data.
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/admin/login");
  }

  return user;
}
