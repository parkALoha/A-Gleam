import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (typeof body?.enabled !== "boolean") {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("shop_settings")
    .update({ maintenance_mode: body.enabled })
    .eq("id", true);

  if (error) {
    return NextResponse.json({ error: "อัปเดตไม่สำเร็จ" }, { status: 400 });
  }

  return NextResponse.json({ enabled: body.enabled });
}
