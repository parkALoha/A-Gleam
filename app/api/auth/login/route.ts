import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
});

const GENERIC_ERROR = "อีเมล/เบอร์โทร หรือรหัสผ่านไม่ถูกต้อง";

// Resolves phone → email and signs in server-side in one step, so the
// client never learns whether a given phone number is registered or what
// email it maps to (a separate "resolve phone" endpoint that returned the
// email directly was an account-enumeration / email-disclosure leak).
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "ลองมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง" },
      { status: 429 },
    );
  }

  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  let loginEmail = body.data.identifier;
  if (!loginEmail.includes("@")) {
    const service = createServiceClient();
    const { data: profile } = await service
      .from("profiles")
      .select("id")
      .eq("phone", loginEmail)
      .maybeSingle();

    const userId = profile?.id;
    const { data: userData } = userId
      ? await service.auth.admin.getUserById(userId)
      : { data: null };

    if (!userData?.user?.email) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }
    loginEmail = userData.user.email;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password: body.data.password,
  });

  if (error) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
