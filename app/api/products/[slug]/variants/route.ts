import { NextResponse } from "next/server";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, product_variants(id, color_name, images, stock_quantity, sort_order)",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
  }

  const variants = [...data.product_variants]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((v) => ({
      id: v.id,
      colorName: v.color_name,
      image: v.images[0] ?? null,
      quantityAvailable: v.stock_quantity,
      inStock: v.stock_quantity > 0,
    }));

  return NextResponse.json({ variants });
}
