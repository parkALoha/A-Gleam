import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { createShipment } from "@/lib/flash-express";

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

  const { trackingNumber } = await createShipment(orderNumber);

  const { data: order, error } = await supabase
    .from("orders")
    .update({
      status: "shipped",
      tracking_number: trackingNumber,
      updated_at: new Date().toISOString(),
    })
    .eq("order_number", orderNumber)
    .eq("status", "confirmed")
    .select("id")
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json(
      { error: "พิมพ์ label ไม่สำเร็จ (อาจถูกดำเนินการไปแล้ว)" },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true, trackingNumber });
}
