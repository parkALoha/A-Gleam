import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  orderId: z.string().uuid(),
  imageUrl: z.string().min(1),
  caption: z.string().trim().max(500).nullable(),
  rating: z.number().int().min(1).max(5),
});

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, customer_name, status")
    .eq("id", body.data.orderId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "ไม่พบคำสั่งซื้อนี้" }, { status: 404 });
  }
  if (order.status !== "delivered") {
    return NextResponse.json(
      { error: "รีวิวได้เฉพาะออเดอร์ที่จัดส่งสำเร็จแล้ว" },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("reviews").insert({
    order_id: order.id,
    customer_id: user.id,
    customer_handle: order.customer_name,
    image_url: body.data.imageUrl,
    caption: body.data.caption || null,
    rating: body.data.rating,
    is_visible: false,
  });

  if (error) {
    const message =
      error.code === "23505" ? "ออเดอร์นี้รีวิวไปแล้ว" : "ส่งรีวิวไม่สำเร็จ ลองใหม่อีกครั้ง";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
