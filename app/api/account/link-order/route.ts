import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";

const schema = z.object({
  orderNumber: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  userId: z.string().uuid(),
});

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Re-verify order number + phone match before linking — the same guard
  // as guest tracking, so this endpoint can't be used to claim someone
  // else's order just by knowing (or guessing) the order number.
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, customer_phone, customer_id")
    .eq("order_number", body.data.orderNumber.trim())
    .maybeSingle();

  if (fetchError || !order || order.customer_phone !== body.data.phone.trim()) {
    return NextResponse.json({ error: "ไม่พบคำสั่งซื้อนี้" }, { status: 404 });
  }

  if (order.customer_id) {
    return NextResponse.json({ error: "คำสั่งซื้อนี้ผูกบัญชีไว้แล้ว" }, { status: 409 });
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ customer_id: body.data.userId })
    .eq("id", order.id);

  if (updateError) {
    return NextResponse.json({ error: "ผูกบัญชีไม่สำเร็จ" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
