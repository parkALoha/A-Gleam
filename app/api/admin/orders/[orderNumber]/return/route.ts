import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { sendOrderStatusEmail } from "@/lib/email";

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
  const { data: order, error } = await supabase
    .from("orders")
    .update({ status: "returned", updated_at: new Date().toISOString() })
    .eq("order_number", orderNumber)
    .eq("status", "shipped")
    .select("id, customer_name, customer_email")
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json(
      { error: "อัปเดตสถานะไม่สำเร็จ (อาจถูกดำเนินการไปแล้ว)" },
      { status: 400 },
    );
  }

  await supabase.rpc("restock_returned_order", { p_order_id: order.id });

  if (order.customer_email) {
    await sendOrderStatusEmail({
      to: order.customer_email,
      customerName: order.customer_name,
      orderNumber,
      status: "returned",
    });
  }

  return NextResponse.json({ success: true });
}
