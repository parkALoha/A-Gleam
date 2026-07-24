import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

const schema = z.object({ trackingNumber: z.string().trim().optional() });

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
  const trackingNumber = body.success ? body.data.trackingNumber : undefined;

  const supabase = createServiceClient();
  const { data: order, error } = await supabase
    .from("orders")
    .update({
      status: "shipped",
      tracking_number: trackingNumber || null,
      updated_at: new Date().toISOString(),
    })
    .eq("order_number", orderNumber)
    .eq("status", "confirmed")
    .select("id")
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json(
      { error: "อัปเดตสถานะไม่สำเร็จ (อาจถูกดำเนินการไปแล้ว)" },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
