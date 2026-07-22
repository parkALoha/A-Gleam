import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

const colorSlugs = [
  { slug: "ally-top-beige", color: "เบจ" },
  { slug: "ally-top-black", color: "ดำ" },
  { slug: "ally-top-grey", color: "เทา" },
  { slug: "ally-top-navy", color: "กรมท่า" },
  { slug: "ally-top-red", color: "แดง" },
];

const { data: oldProducts, error: fetchError } = await supabase
  .from("products")
  .select("id, slug, name, price, description, measurements, tag, images, stock_quantity")
  .in(
    "slug",
    colorSlugs.map((c) => c.slug),
  );

if (fetchError) {
  console.error("Fetch failed:", fetchError.message);
  process.exit(1);
}

if (oldProducts.length === 0) {
  console.log("No old Ally Top color-per-listing products found — already migrated?");
  process.exit(0);
}

const base = oldProducts[0];

const { data: newProduct, error: insertError } = await supabase
  .from("products")
  .upsert(
    {
      slug: "ally-top",
      name: "เสื้อ Ally Top",
      price: base.price,
      description: base.description,
      measurements: base.measurements,
      tag: null,
      is_published: true,
    },
    { onConflict: "slug" },
  )
  .select("id")
  .single();

if (insertError) {
  console.error("Insert parent product failed:", insertError.message);
  process.exit(1);
}

const variantRows = oldProducts.map((p) => {
  const match = colorSlugs.find((c) => c.slug === p.slug);
  return {
    product_id: newProduct.id,
    color_name: match.color,
    images: p.images,
    stock_quantity: p.stock_quantity,
    sort_order: colorSlugs.indexOf(match),
  };
});

const { error: variantsError } = await supabase
  .from("product_variants")
  .insert(variantRows);

if (variantsError) {
  console.error("Insert variants failed:", variantsError.message);
  process.exit(1);
}

const { error: deleteError } = await supabase
  .from("products")
  .delete()
  .in(
    "id",
    oldProducts.map((p) => p.id),
  );

if (deleteError) {
  console.error("Delete old products failed:", deleteError.message);
  process.exit(1);
}

console.log(
  `Migrated ${oldProducts.length} color listings into 1 product ("ally-top") with ${variantRows.length} variants.`,
);
