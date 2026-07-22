import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

// Duplicates the existing "ally-top" product's photos/variants into a batch
// of mock listings per tag (new / bestseller / sale), each with a distinct
// name/slug so the category rows and filters are visually testable end to
// end without waiting on real new stock.
const { data: source, error: sourceError } = await supabase
  .from("products")
  .select(
    "price, description, measurements, cover_image, video_url, product_variants(color_name, images, stock_quantity, sort_order)",
  )
  .eq("slug", "ally-top")
  .maybeSingle();

if (sourceError || !source) {
  console.error("ไม่พบสินค้าต้นแบบ ally-top:", sourceError?.message);
  process.exit(1);
}

// Remove the old single mock-per-tag products from the previous seed run.
await supabase
  .from("products")
  .delete()
  .in("slug", ["ally-top-new", "ally-top-sale", "ally-top-bestseller"]);

const NEW_NAMES = [
  "เสื้อ Ivy Blouse",
  "เสื้อ Coco Shirt",
  "เสื้อ Daisy Top",
  "เสื้อ Luna Blouse",
  "เสื้อ Mimi Top",
  "เสื้อ Rosy Shirt",
  "เสื้อ Aria Top",
  "เสื้อ Bloom Blouse",
  "เสื้อ Nova Shirt",
  "เสื้อ Willow Top",
];

const BESTSELLER_NAMES = [
  "เสื้อ Classic Ally Top",
  "เสื้อ Signature Blouse",
  "เสื้อ Everyday Top",
  "เสื้อ Chic Shirt",
  "เสื้อ Grace Blouse",
  "เสื้อ Sunny Top",
  "เสื้อ Pearl Shirt",
  "เสื้อ Bella Top",
  "เสื้อ Harper Blouse",
  "เสื้อ Ivy Signature Top",
];

const SALE_NAMES = [
  "เสื้อ Clearance Ally Top",
  "เสื้อ Outlet Blouse",
  "เสื้อ End of Season Top",
  "เสื้อ Last Call Shirt",
  "เสื้อ Final Sale Blouse",
  "เสื้อ Bargain Top",
  "เสื้อ Discount Shirt",
  "เสื้อ Sale Edition Top",
  "เสื้อ Special Price Blouse",
  "เสื้อ Warehouse Top",
];

function slugify(name) {
  return name
    .replace(/^เสื้อ\s*/, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

const batches = [
  { names: NEW_NAMES, tag: "ใหม่", sale: false },
  { names: BESTSELLER_NAMES, tag: "ขายดี", sale: false },
  { names: SALE_NAMES, tag: "ลดราคา", sale: true },
];

for (const batch of batches) {
  for (const name of batch.names) {
    const slug = slugify(name);
    const compareAtPrice = batch.sale ? Math.round(source.price * 1.3) : null;

    const { data: product, error: upsertError } = await supabase
      .from("products")
      .upsert(
        {
          slug,
          name,
          price: source.price,
          compare_at_price: compareAtPrice,
          description: source.description,
          measurements: source.measurements,
          cover_image: source.cover_image,
          video_url: source.video_url,
          tag: batch.tag,
          is_published: true,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();

    if (upsertError) {
      console.error(`สร้าง ${slug} ไม่สำเร็จ:`, upsertError.message);
      continue;
    }

    await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", product.id);

    const variants = source.product_variants.map((v) => ({
      product_id: product.id,
      color_name: v.color_name,
      images: v.images,
      stock_quantity: v.stock_quantity,
      sort_order: v.sort_order,
    }));

    const { error: variantsError } = await supabase
      .from("product_variants")
      .insert(variants);

    if (variantsError) {
      console.error(`เพิ่มสี ${slug} ไม่สำเร็จ:`, variantsError.message);
      continue;
    }

    console.log(`สร้าง ${slug} (tag: ${batch.tag}) สำเร็จ`);
  }
}
