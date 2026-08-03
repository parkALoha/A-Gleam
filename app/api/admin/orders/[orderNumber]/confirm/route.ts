import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const { orderNumber } = await params;
  const supabase = createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "ไม่พบคำสั่งซื้อนี้" }, { status: 404 });
  }

  const { error } = await supabase.rpc("confirm_order", {
    p_order_id: order.id,
  });

  if (error) {
    const message = error.message?.includes("insufficient stock")
      ? "ยืนยันไม่สำเร็จ — สต็อกไม่พอ (อาจมีออเดอร์อื่นที่ยืนยันไปแล้วตัดสต็อกไปก่อน กรุณาตรวจสอบ)"
      : "ยืนยันคำสั่งซื้อไม่สำเร็จ (อาจถูกดำเนินการไปแล้ว)";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
