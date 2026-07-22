import { createPublicSupabaseClient } from "@/lib/supabase/public";

export type ShopSettings = {
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  promptpayQrImageUrl: string | null;
  heroImageUrls: string[];
  heroHeadline: string | null;
  reviewsSectionEnabled: boolean;
};

export async function getShopSettings(): Promise<ShopSettings> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("shop_settings")
    .select(
      "bank_name, bank_account_name, bank_account_number, promptpay_qr_image_url, hero_image_urls, hero_headline, reviews_section_enabled",
    )
    .single();

  if (error) {
    throw new Error(`Failed to load shop settings: ${error.message}`);
  }

  return {
    bankName: data.bank_name,
    bankAccountName: data.bank_account_name,
    bankAccountNumber: data.bank_account_number,
    promptpayQrImageUrl: data.promptpay_qr_image_url,
    heroImageUrls: data.hero_image_urls ?? [],
    heroHeadline: data.hero_headline,
    reviewsSectionEnabled: data.reviews_section_enabled ?? false,
  };
}
