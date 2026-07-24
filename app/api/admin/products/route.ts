import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  colorName: z.string().trim().min(1),
  images: z.array(z.string()),
  stockQuantity: z.number().int().min(0),
});

const productSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).nullable(),
  tag: z.enum(["ใหม่", "ขายดี", "ลดราคา", "ตำหนิ"]).nullable(),
  description: z.string().trim(),
  measurements: z.object({
    bust: z.number(),
    length: z.number(),
    shoulder: z.number(),
  }),
  videoUrl: z.string().trim().nullable(),
  coverImage: z.string().nullable(),
  isPublished: z.boolean(),
  variants: z.array(variantSchema).min(1),
});

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const body = productSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      slug: body.data.slug,
      name: body.data.name,
      price: body.data.price,
      compare_at_price: body.data.compareAtPrice,
      tag: body.data.tag,
      description: body.data.description,
      measurements: body.data.measurements,
      video_url: body.data.videoUrl,
      cover_image: body.data.coverImage,
      is_published: body.data.isPublished,
    })
    .select("id, slug")
    .single();

  if (error || !product) {
    const message =
      error?.code === "23505" ? "Slug นี้ถูกใช้แล้ว ลองเปลี่ยนดู" : "สร้างสินค้าไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const variantRows = body.data.variants.map((v, i) => ({
    product_id: product.id,
    color_name: v.colorName,
    images: v.images,
    stock_quantity: v.stockQuantity,
    sort_order: i,
  }));

  const { error: variantError } = await supabase.from("product_variants").insert(variantRows);
  if (variantError) {
    // Roll back so we don't leave an orphaned product with no colors.
    await supabase.from("products").delete().eq("id", product.id);
    return NextResponse.json({ error: "สร้างสีสินค้าไม่สำเร็จ" }, { status: 400 });
  }

  return NextResponse.json({ id: product.id, slug: product.slug });
}
