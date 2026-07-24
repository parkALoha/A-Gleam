import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

const schema = z.object({
  tag: z.enum(["ใหม่", "ขายดี", "ลดราคา", "ตำหนิ"]).nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const { id } = await params;
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("products").update({ tag: body.data.tag }).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "อัปเดตป้ายไม่สำเร็จ" }, { status: 400 });
  }

  return NextResponse.json({ tag: body.data.tag });
}
