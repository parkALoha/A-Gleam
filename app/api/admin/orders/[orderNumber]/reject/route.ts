import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { sendOrderStatusEmail } from "@/lib/email";

const schema = z.object({ note: z.string().trim().optional() });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const { orderNumber } = await params;
  const body = schema.safeParse(await request.json().catch(() => ({})));
  const note = body.success ? body.data.note : undefined;

  const supabase = createServiceClient();
  const { data: order, error } = await supabase
    .from("orders")
    .update({
      status: "rejected",
      admin_note: note || null,
      updated_at: new Date().toISOString(),
    })
    .eq("order_number", orderNumber)
    .eq("status", "pending_verification")
    .select("id, customer_name, customer_email")
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json(
      { error: "ปฏิเสธคำสั่งซื้อไม่สำเร็จ (อาจถูกดำเนินการไปแล้ว)" },
      { status: 400 },
    );
  }

  if (order.customer_email) {
    await sendOrderStatusEmail({
      to: order.customer_email,
      customerName: order.customer_name,
      orderNumber,
      status: "rejected",
    });
  }

  return NextResponse.json({ success: true });
}
