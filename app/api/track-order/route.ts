import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

const schema = z.object({
  orderNumber: z.string().trim().min(1),
  phone: z.string().trim().min(1),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!(await checkRateLimit(`track-order:${ip}`, 10, 15 * 60 * 1000))) {
    return NextResponse.json(
      { error: "ลองมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง" },
      { status: 429 },
    );
  }

  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json(
      { error: "กรุณากรอกเลขคำสั่งซื้อและเบอร์โทร" },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  // Require BOTH order number and phone to match — a phone number alone
  // isn't a secret, so looking up by phone only would let anyone who knows
  // (or guesses) a customer's number see their full order history.
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "order_number, status, total_amount, tracking_number, created_at, customer_phone, order_items(product_name, color_name, unit_price, quantity)",
    )
    .eq("order_number", body.data.orderNumber.trim())
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง" }, { status: 500 });
  }

  if (!order || order.customer_phone !== body.data.phone.trim()) {
    return NextResponse.json(
      { error: "ไม่พบคำสั่งซื้อนี้ กรุณาตรวจสอบเลขคำสั่งซื้อและเบอร์โทรอีกครั้ง" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    order: {
      orderNumber: order.order_number,
      status: order.status,
      statusLabel: ORDER_STATUS_LABELS[order.status] ?? order.status,
      totalAmount: order.total_amount,
      trackingNumber: order.tracking_number,
      createdAt: order.created_at,
      items: order.order_items,
    },
  });
}
