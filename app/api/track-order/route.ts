import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

const schema = z.object({
  phone: z.string().trim().min(1),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`track-order:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "ลองมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง" },
      { status: 429 },
    );
  }

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
      "order_number, status, total_amount, tracking_number, created_at, order_items(product_name, color_name, unit_price, quantity)",
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
      statusLabel: ORDER_STATUS_LABELS[order.status] ?? order.status,
      totalAmount: order.total_amount,
      trackingNumber: order.tracking_number,
      createdAt: order.created_at,
      items: order.order_items,
    })),
  });
}
