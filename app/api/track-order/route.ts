import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";

const schema = z.object({
  phone: z.string().trim().min(1),
});

const STATUS_LABELS: Record<string, string> = {
  pending_verification: "รอตรวจสอบการชำระเงิน",
  confirmed: "ยืนยันคำสั่งซื้อแล้ว รอจัดส่ง",
  rejected: "การชำระเงินไม่ถูกต้อง กรุณาติดต่อร้าน",
};

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json(
      { error: "กรุณากรอกเบอร์โทร" },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "order_number, status, total_amount, created_at, order_items(product_name, color_name, unit_price, quantity)",
    )
    .eq("customer_phone", body.data.phone.trim())
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง" }, { status: 500 });
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json(
      { error: "ไม่พบคำสั่งซื้อของเบอร์นี้" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    orders: orders.map((order) => ({
      orderNumber: order.order_number,
      status: order.status,
      statusLabel: STATUS_LABELS[order.status] ?? order.status,
      totalAmount: order.total_amount,
      createdAt: order.created_at,
      items: order.order_items,
    })),
  });
}
