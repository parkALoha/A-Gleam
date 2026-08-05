import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

const heroLineSchema = z.object({
  text: z.string(),
  size: z.number().min(0.1).max(50),
});

const heroSlideSchema = z.object({
  imageUrl: z.string().min(1),
  lines: z.array(heroLineSchema),
  positionX: z.number().min(0).max(100),
  positionY: z.number().min(0).max(100),
  overlay: z.enum(["light", "medium", "dark"]),
  linkUrl: z.string().trim(),
});

const schema = z.object({
  bankName: z.string().trim().nullable(),
  bankCode: z.string().trim().nullable(),
  bankAccountName: z.string().trim().nullable(),
  bankAccountNumber: z.string().trim().nullable(),
  promptpayQrImageUrl: z.string().nullable(),
  promptpayId: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^\d{10}$/.test(v) || /^\d{13}$/.test(v),
      "เลขพร้อมเพย์ต้องเป็นเบอร์โทร 10 หลัก หรือเลขบัตรประชาชน 13 หลัก",
    ),
  heroSlides: z.array(heroSlideSchema),
  reviewsSectionEnabled: z.boolean(),
  slipVerificationMode: z.enum(["manual", "semi_auto", "auto_confirm"]),
});

export async function PATCH(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    const issue = body.error.issues[0];
    const field = issue?.path.join(".") || "ข้อมูล";
    return NextResponse.json(
      { error: `ข้อมูลไม่ถูกต้องที่ "${field}": ${issue?.message ?? "รูปแบบไม่ถูกต้อง"}` },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("shop_settings")
    .update({
      bank_name: body.data.bankName || null,
      bank_code: body.data.bankCode || null,
      bank_account_name: body.data.bankAccountName || null,
      bank_account_number: body.data.bankAccountNumber || null,
      promptpay_qr_image_url: body.data.promptpayQrImageUrl,
      promptpay_id: body.data.promptpayId || null,
      hero_slides: body.data.heroSlides,
      reviews_section_enabled: body.data.reviewsSectionEnabled,
      slip_verification_mode: body.data.slipVerificationMode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) {
    return NextResponse.json({ error: `บันทึกไม่สำเร็จ: ${error.message}` }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
