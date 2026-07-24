import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({ phone: z.string().trim().min(1) });

// Supabase's password login only takes an email — this looks up which
// account a phone number belongs to, so the login form can accept either.
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`resolve-phone:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "ลองมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง" },
      { status: 429 },
    );
  }

  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", body.data.phone.trim())
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "ไม่พบบัญชีเบอร์นี้" }, { status: 404 });
  }

  const { data: userData, error } =
    await supabase.auth.admin.getUserById(profile.id);

  if (error || !userData.user?.email) {
    return NextResponse.json({ error: "ไม่พบบัญชีเบอร์นี้" }, { status: 404 });
  }

  return NextResponse.json({ email: userData.user.email });
}
