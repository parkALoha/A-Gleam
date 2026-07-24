import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

const schema = z.object({
  customerHandle: z.string().trim().min(1),
  imageUrl: z.string().min(1),
  caption: z.string().trim().nullable(),
  rating: z.number().int().min(1).max(5),
  isVisible: z.boolean(),
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
  const { error } = await supabase
    .from("reviews")
    .update({
      customer_handle: body.data.customerHandle,
      image_url: body.data.imageUrl,
      caption: body.data.caption || null,
      rating: body.data.rating,
      is_visible: body.data.isVisible,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "บันทึกไม่สำเร็จ" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = createServiceClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "ลบไม่สำเร็จ" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
