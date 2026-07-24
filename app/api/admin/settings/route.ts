import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

const schema = z.object({
  bankName: z.string().trim().nullable(),
  bankAccountName: z.string().trim().nullable(),
  bankAccountNumber: z.string().trim().nullable(),
  promptpayQrImageUrl: z.string().nullable(),
  heroImageUrls: z.array(z.string()),
  heroHeadline: z.string().trim().nullable(),
  reviewsSectionEnabled: z.boolean(),
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
      bank_account_name: body.data.bankAccountName || null,
      bank_account_number: body.data.bankAccountNumber || null,
      promptpay_qr_image_url: body.data.promptpayQrImageUrl,
      hero_image_urls: body.data.heroImageUrls,
      hero_headline: body.data.heroHeadline || null,
      reviews_section_enabled: body.data.reviewsSectionEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) {
    return NextResponse.json({ error: "บันทึกไม่สำเร็จ" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
