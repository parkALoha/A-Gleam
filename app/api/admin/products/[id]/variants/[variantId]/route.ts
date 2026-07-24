import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const { id, variantId } = await params;
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId)
    .eq("product_id", id);

  if (error) {
    // FK violation (23503): this variant is referenced by a past order_item.
    const message =
      error.code === "23503"
        ? "ลบสีนี้ไม่ได้ เพราะมีคำสั่งซื้อเก่าอ้างอิงอยู่ — ตั้งสต็อกเป็น 0 แทน"
        : "ลบสีไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
