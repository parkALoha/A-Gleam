import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/order-number";
import { isAllowedImageType } from "@/lib/image-validation";
import { fileTypeFromBuffer } from "file-type";
import { buildOrderItems, type VariantWithProduct } from "@/lib/order-pricing";
import { verifySlip } from "@/lib/slip2go";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const orderFieldsSchema = z.object({
  customer_name: z.string().trim().min(1, "กรุณากรอกชื่อ-นามสกุล"),
  customer_phone: z.string().trim().regex(/^\d{10}$/, "เบอร์โทรต้องเป็นตัวเลข 10 หลัก"),
  address_line: z.string().trim().min(1, "กรุณากรอกที่อยู่"),
  subdistrict: z.string().trim().min(1, "กรุณาเลือกตำบล/แขวง"),
  district: z.string().trim().min(1, "กรุณาเลือกอำเภอ/เขต"),
  province: z.string().trim().min(1, "กรุณาเลือกจังหวัด"),
  postal_code: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก"),
  // Optional — only used to send order-status notifications, guest checkout
  // without one still works exactly the same.
  customer_email: z.union([z.literal(""), z.string().trim().email()]).optional(),
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
  const ip = getClientIp(request);
  if (!(await checkRateLimit(`create-order:${ip}`, 10, 15 * 60 * 1000))) {
    return NextResponse.json(
      { error: "ลองมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง" },
      { status: 429 },
    );
  }

  const formData = await request.formData();

  const fields = orderFieldsSchema.safeParse({
    customer_name: formData.get("customer_name"),
    customer_phone: formData.get("customer_phone"),
    address_line: formData.get("address_line"),
    subdistrict: formData.get("subdistrict"),
    district: formData.get("district"),
    province: formData.get("province"),
    postal_code: formData.get("postal_code"),
    customer_email: formData.get("customer_email") ?? "",
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
  if (!isAllowedImageType(slip.type)) {
    return NextResponse.json(
      { error: "ไฟล์สลิปต้องเป็นรูปภาพ JPEG, PNG หรือ WebP" },
      { status: 400 },
    );
  }
  if (slip.size > MAX_SLIP_SIZE) {
    return NextResponse.json(
      { error: "ไฟล์สลิปใหญ่เกินไป (สูงสุด 5MB)" },
      { status: 400 },
    );
  }

  // Don't trust the declared Content-Type alone — sniff the actual bytes so
  // a file with a spoofed "image/*" header can't slip through as something
  // else entirely.
  const slipBuffer = Buffer.from(await slip.arrayBuffer());
  const detectedType = await fileTypeFromBuffer(slipBuffer);
  if (!detectedType || !isAllowedImageType(detectedType.mime)) {
    return NextResponse.json(
      { error: "ไฟล์สลิปต้องเป็นรูปภาพ JPEG, PNG หรือ WebP" },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

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

  const result = buildOrderItems(items, variantById);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const { orderItems, totalAmount } = result;

  const sessionClient = await createServerSupabaseClient();
  const {
    data: { user: loggedInCustomer },
  } = await sessionClient.auth.getUser();

  const orderId = crypto.randomUUID();
  const orderNumber = generateOrderNumber();
  const slipPath = `${orderId}/slip.${detectedType.ext}`;

  const { data: settings } = await supabase
    .from("shop_settings")
    .select("slip_verification_mode, bank_code, bank_account_number, bank_account_name")
    .single();
  const verificationMode = settings?.slip_verification_mode ?? "manual";
  const receiver =
    settings?.bank_code && settings?.bank_account_number && settings?.bank_account_name
      ? {
          bankCode: settings.bank_code,
          accountNumber: settings.bank_account_number,
          accountNameTH: settings.bank_account_name,
        }
      : undefined;

  const [{ error: uploadError }, verification] = await Promise.all([
    supabase.storage
      .from("payment-slips")
      .upload(slipPath, slipBuffer, { contentType: detectedType.mime }),
    verificationMode === "manual"
      ? Promise.resolve(null)
      : verifySlip(slipBuffer, detectedType.mime, totalAmount, receiver),
  ]);

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
    customer_email: fields.data.customer_email || null,
    address_line: fields.data.address_line,
    subdistrict: fields.data.subdistrict,
    district: fields.data.district,
    province: fields.data.province,
    postal_code: fields.data.postal_code,
    total_amount: totalAmount,
    slip_image_path: slipPath,
    status: "pending_verification",
    customer_id: loggedInCustomer?.id ?? null,
    slip_verification_status: verification?.status ?? null,
    slip_verification_result: verification?.raw ?? null,
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
    // Don't leave a half-written order behind — a row in `orders` with no
    // items would sit in the admin queue looking paid-but-empty, and the
    // customer would have no working order to point their slip at anyway.
    await supabase.from("orders").delete().eq("id", orderId);
    await supabase.storage.from("payment-slips").remove([slipPath]);
    return NextResponse.json(
      { error: "บันทึกรายการสินค้าไม่สำเร็จ ลองใหม่อีกครั้ง" },
      { status: 500 },
    );
  }

  // Only auto-confirm on a confident, independently-checked match — any
  // ambiguity (error, mismatch, fraud flag) always falls back to the normal
  // manual-review queue instead of guessing.
  if (verificationMode === "auto_confirm" && verification?.status === "verified") {
    await supabase.rpc("confirm_order", { p_order_id: orderId });
  }

  return NextResponse.json({ orderNumber }, { status: 201 });
}
