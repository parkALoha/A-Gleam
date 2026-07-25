import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

const heroSlideSchema = z.object({
  imageUrl: z.string().min(1),
  headline: z.string().trim(),
  position: z.enum(["top", "center", "bottom"]),
  overlay: z.enum(["light", "medium", "dark"]),
  linkUrl: z.string().trim(),
});

const schema = z.object({
  bankName: z.string().trim().nullable(),
  bankCode: z.string().trim().nullable(),
  bankAccountName: z.string().trim().nullable(),
  bankAccountNumber: z.string().trim().nullable(),
  promptpayQrImageUrl: z.string().nullable(),
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
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
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
      hero_slides: body.data.heroSlides,
      reviews_section_enabled: body.data.reviewsSectionEnabled,
      slip_verification_mode: body.data.slipVerificationMode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) {
    return NextResponse.json({ error: "บันทึกไม่สำเร็จ" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
