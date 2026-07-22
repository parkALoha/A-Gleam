import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/order-number";

const orderFieldsSchema = z.object({
  customer_name: z.string().trim().min(1, "กรุณากรอกชื่อ-นามสกุล"),
  customer_phone: z.string().trim().min(1, "กรุณากรอกเบอร์โทร"),
  address_line: z.string().trim().min(1, "กรุณากรอกที่อยู่"),
  subdistrict: z.string().trim().min(1, "กรุณาเลือกตำบล/แขวง"),
  district: z.string().trim().min(1, "กรุณาเลือกอำเภอ/เขต"),
  province: z.string().trim().min(1, "กรุณาเลือกจังหวัด"),
  postal_code: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก"),
});

const itemsSchema = z
  .array(
    z.object({
      variantId: z.string().uuid(),
      quantity: z.number().int().positive(),
    }),
  )
  .min(1, "ตะกร้าว่างอยู่");

const MAX_SLIP_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();

  const fields = orderFieldsSchema.safeParse({
    customer_name: formData.get("customer_name"),
    customer_phone: formData.get("customer_phone"),
    address_line: formData.get("address_line"),
    subdistrict: formData.get("subdistrict"),
    district: formData.get("district"),
    province: formData.get("province"),
    postal_code: formData.get("postal_code"),
  });
  if (!fields.success) {
    return NextResponse.json(
      { error: fields.error.issues[0].message },
      { status: 400 },
    );
  }

  let items: z.infer<typeof itemsSchema>;
  try {
    items = itemsSchema.parse(JSON.parse(String(formData.get("items"))));
  } catch {
    return NextResponse.json({ error: "ตะกร้าไม่ถูกต้อง" }, { status: 400 });
  }

  const slip = formData.get("slip");
  if (!(slip instanceof File) || slip.size === 0) {
    return NextResponse.json(
      { error: "กรุณาแนบรูปสลิปโอนเงิน" },
      { status: 400 },
    );
  }
  if (!slip.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "ไฟล์สลิปต้องเป็นรูปภาพ" },
      { status: 400 },
    );
  }
  if (slip.size > MAX_SLIP_SIZE) {
    return NextResponse.json(
      { error: "ไฟล์สลิปใหญ่เกินไป (สูงสุด 5MB)" },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  type VariantWithProduct = {
    id: string;
    color_name: string;
    stock_quantity: number;
    products: { id: string; name: string; price: number } | null;
  };

  const variantIds = items.map((i) => i.variantId);
  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, color_name, stock_quantity, products(id, name, price)")
    .in("id", variantIds);

  if (variantsError) {
    return NextResponse.json(
      { error: "โหลดข้อมูลสินค้าไม่สำเร็จ" },
      { status: 500 },
    );
  }

  const variantById = new Map(
    (variants as unknown as VariantWithProduct[]).map((v) => [v.id, v]),
  );
  const orderItems: {
    variant_id: string;
    product_id: string;
    product_name: string;
    color_name: string;
    unit_price: number;
    quantity: number;
  }[] = [];
  let totalAmount = 0;

  for (const item of items) {
    const variant = variantById.get(item.variantId);
    const product = variant?.products;
    if (!variant || !product) {
      return NextResponse.json(
        { error: "สินค้าบางรายการไม่มีอยู่แล้ว กรุณารีเฟรชตะกร้า" },
        { status: 400 },
      );
    }
    if (variant.stock_quantity < item.quantity) {
      return NextResponse.json(
        {
          error: `"${product.name} (${variant.color_name})" เหลือไม่พอ (คงเหลือ ${variant.stock_quantity} ชิ้น)`,
        },
        { status: 400 },
      );
    }
    orderItems.push({
      variant_id: variant.id,
      product_id: product.id,
      product_name: product.name,
      color_name: variant.color_name,
      unit_price: Number(product.price),
      quantity: item.quantity,
    });
    totalAmount += Number(product.price) * item.quantity;
  }

  const sessionClient = await createServerSupabaseClient();
  const {
    data: { user: loggedInCustomer },
  } = await sessionClient.auth.getUser();

  const orderId = crypto.randomUUID();
  const orderNumber = generateOrderNumber();
  const slipExt = slip.type.split("/")[1] || "jpg";
  const slipPath = `${orderId}/slip.${slipExt}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-slips")
    .upload(slipPath, slip, { contentType: slip.type });

  if (uploadError) {
    return NextResponse.json(
      { error: "อัปโหลดสลิปไม่สำเร็จ ลองใหม่อีกครั้ง" },
      { status: 500 },
    );
  }

  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    order_number: orderNumber,
    customer_name: fields.data.customer_name,
    customer_phone: fields.data.customer_phone,
    address_line: fields.data.address_line,
    subdistrict: fields.data.subdistrict,
    district: fields.data.district,
    province: fields.data.province,
    postal_code: fields.data.postal_code,
    total_amount: totalAmount,
    slip_image_path: slipPath,
    status: "pending_verification",
    customer_id: loggedInCustomer?.id ?? null,
  });

  if (orderError) {
    await supabase.storage.from("payment-slips").remove([slipPath]);
    return NextResponse.json(
      { error: "บันทึกคำสั่งซื้อไม่สำเร็จ ลองใหม่อีกครั้ง" },
      { status: 500 },
    );
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    orderItems.map((item) => ({ ...item, order_id: orderId })),
  );

  if (itemsError) {
    return NextResponse.json(
      { error: "บันทึกรายการสินค้าไม่สำเร็จ ลองใหม่อีกครั้ง" },
      { status: 500 },
    );
  }

  return NextResponse.json({ orderNumber }, { status: 201 });
}
