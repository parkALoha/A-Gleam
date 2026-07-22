import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

const measurements = { bust: 96, length: 56, shoulder: 37 };

const colors = [
  { key: "beige", th: "เบจ" },
  { key: "black", th: "ดำ" },
  { key: "grey", th: "เทา" },
  { key: "navy", th: "กรมท่า" },
  { key: "red", th: "แดง" },
];

const products = colors.map(({ key, th }) => ({
  slug: `ally-top-${key}`,
  name: `เสื้อ Ally Top สี${th}`,
  price: 450,
  description:
    "เสื้อ Ally Top ทรงสวย ใส่สบาย ผ้าเนื้อดีไม่ยับง่าย ใส่ได้ทั้งลุคทำงานและลุคสบายๆ",
  images: [
    `/products/ally-top/${key}/1.jpg`,
    `/products/ally-top/${key}/2.jpg`,
    `/products/ally-top/${key}/3.jpg`,
  ],
  measurements,
  stock_quantity: 8,
  tag: null,
}));

const { error } = await supabase
  .from("products")
  .upsert(products, { onConflict: "slug" });

if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}

console.log(`Seeded ${products.length} Ally Top color variants.`);
