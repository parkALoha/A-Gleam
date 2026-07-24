import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

const schema = z.object({
  customerHandle: z.string().trim().min(1),
  imageUrl: z.string().min(1),
  caption: z.string().trim().nullable(),
  rating: z.number().int().min(1).max(5),
});

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("reviews")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("reviews").insert({
    customer_handle: body.data.customerHandle,
    image_url: body.data.imageUrl,
    caption: body.data.caption || null,
    rating: body.data.rating,
    sort_order: (existing?.sort_order ?? -1) + 1,
  });

  if (error) {
    return NextResponse.json({ error: "เพิ่มรีวิวไม่สำเร็จ" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
