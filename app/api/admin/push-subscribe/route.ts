import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const unsubscribeSchema = z.object({
  endpoint: z.string().url(),
});

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const body = subscribeSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: admin.id,
      endpoint: body.data.endpoint,
      p256dh: body.data.keys.p256dh,
      auth_key: body.data.keys.auth,
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    return NextResponse.json({ error: "เปิดการแจ้งเตือนไม่สำเร็จ" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const body = unsubscribeSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const supabase = createServiceClient();
  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", body.data.endpoint)
    .eq("user_id", admin.id);

  return NextResponse.json({ success: true });
}
