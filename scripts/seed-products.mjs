import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

const products = [
  {
    slug: "peterpan-blouse-01",
    name: "เสื้อเบลาส์คอปกปีเตอร์แพน",
    price: 450,
    description:
      "เสื้อเบลาส์ผ้าลินินผสมฝ้าย คอปกปีเตอร์แพนน่ารัก ใส่ทำงานหรือเที่ยวก็ได้ ผ้าเนื้อดีไม่บางเกินไป",
    images: [
      "/products/peterpan-blouse-01-1.svg",
      "/products/peterpan-blouse-01-2.svg",
    ],
    measurements: { bust: 96, length: 58, shoulder: 38 },
    stock_quantity: 6,
    tag: "ขายดี",
  },
  {
    slug: "linen-shirt-01",
    name: "เสื้อเชิ้ตผ้าลินินแขนยาว",
    price: 420,
    description:
      "เสื้อเชิ้ตผ้าลินิน 100% ระบายอากาศดี ทรงหลวมใส่สบาย เข้าได้กับทุกลุค casual",
    images: ["/products/linen-shirt-01-1.svg", "/products/linen-shirt-01-2.svg"],
    measurements: { bust: 100, length: 60, shoulder: 40 },
    stock_quantity: 9,
    tag: "ใหม่",
  },
  {
    slug: "knit-top-01",
    name: "เสื้อนิตแขนสั้นคอวี",
    price: 390,
    description:
      "เสื้อนิตเนื้อนุ่ม คอวี แขนสั้น ใส่เดี่ยวหรือคลุมทับก็สวย เนื้อผ้ายืดหยุ่นใส่สบาย",
    images: ["/products/knit-top-01-1.svg", "/products/knit-top-01-2.svg"],
    measurements: { bust: 92, length: 55, shoulder: 36 },
    stock_quantity: 4,
    tag: null,
  },
  {
    slug: "ribbon-blouse-02",
    name: "เสื้อเบลาส์ผูกโบว์แขนพอง",
    price: 480,
    description:
      "เสื้อเบลาส์แขนพอง คอผูกโบว์ ผ้าซาตินเนื้อดี ใส่ออกเดตหรือไปงานก็น่ารัก",
    images: [
      "/products/ribbon-blouse-02-1.svg",
      "/products/ribbon-blouse-02-2.svg",
    ],
    measurements: { bust: 98, length: 59, shoulder: 39 },
    stock_quantity: 0,
    tag: null,
  },
];

const { error } = await supabase
  .from("products")
  .upsert(products, { onConflict: "slug" });

if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}

console.log(`Seeded ${products.length} products.`);
