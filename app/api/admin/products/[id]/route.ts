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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const { id } = await params;
  const body = productSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { error } = await supabase
    .from("products")
    .update({
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
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    const message = error.code === "23505" ? "Slug นี้ถูกใช้แล้ว ลองเปลี่ยนดู" : "บันทึกไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Variants with an id get updated in place; ones without get inserted as
  // new colors. Never deleted here — a variant may already be referenced by
  // past order_items (no ON DELETE on that FK), so retiring a color means
  // setting its stock to 0, not removing the row.
  for (const [i, variant] of body.data.variants.entries()) {
    if (variant.id) {
      await supabase
        .from("product_variants")
        .update({
          color_name: variant.colorName,
          images: variant.images,
          stock_quantity: variant.stockQuantity,
          sort_order: i,
        })
        .eq("id", variant.id);
    } else {
      await supabase.from("product_variants").insert({
        product_id: id,
        color_name: variant.colorName,
        images: variant.images,
        stock_quantity: variant.stockQuantity,
        sort_order: i,
      });
    }
  }

  return NextResponse.json({ id, slug: body.data.slug });
}
