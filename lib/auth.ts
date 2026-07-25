import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Verifies the caller is logged in AND flagged `is_admin` in `profiles`
 * (not just "logged in" — that used to be the whole check, which becomes a
 * hole the moment customers can create accounts too). Returns null instead
 * of redirecting, for use in Route Handlers (`redirect()` from
 * next/navigation is only valid in Server Components/Actions).
 */
export async function getAdminUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return null;
  }

  return user;
}

/**
 * Same admin check as `getAdminUser`, but redirects instead of returning
 * null — the check every admin Server Component page must call before
 * rendering. A signed-out visitor goes to the admin login page (the real
 * entry point); a signed-in customer who just isn't an admin goes home
 * instead — showing them the admin login form again serves no purpose and
 * only invites poking around a section that isn't theirs.
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
    redirect("/");
  }

  return user;
}
