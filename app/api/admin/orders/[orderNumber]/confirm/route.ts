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
    return NextResponse.json(
      { error: "ยืนยันคำสั่งซื้อไม่สำเร็จ (อาจถูกดำเนินการไปแล้ว)" },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
