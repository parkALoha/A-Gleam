import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = createServiceClient();

  const { data: product } = await supabase
    .from("products")
    .select("is_published")
    .eq("id", id)
    .maybeSingle();

  if (!product) {
    return NextResponse.json({ error: "ไม่พบสินค้านี้" }, { status: 404 });
  }

  const { error } = await supabase
    .from("products")
    .update({ is_published: !product.is_published })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "อัปเดตไม่สำเร็จ" }, { status: 400 });
  }

  return NextResponse.json({ isPublished: !product.is_published });
}
