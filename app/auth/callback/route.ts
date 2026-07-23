import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", data.user.id)
        .maybeSingle();

      // First time in from a social login with no phone on file yet — ask
      // for it once so we can find/link any past guest orders by phone.
      if (!profile?.phone) {
        return NextResponse.redirect(`${origin}/account/profile?welcome=1`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/account/orders`);
}
