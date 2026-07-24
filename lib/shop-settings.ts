import { createPublicSupabaseClient } from "@/lib/supabase/public";

export type HeroPosition = "top" | "center" | "bottom";
export type HeroOverlay = "light" | "medium" | "dark";

export type HeroSlide = {
  imageUrl: string;
  headline: string;
  position: HeroPosition;
  overlay: HeroOverlay;
  /** Where "ช้อปเลย" goes — empty means the default "#products" scroll. */
  linkUrl: string;
};

export type ShopSettings = {
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  promptpayQrImageUrl: string | null;
  heroSlides: HeroSlide[];
  reviewsSectionEnabled: boolean;
};

// Rows saved before linkUrl existed won't have it in the stored jsonb —
// default it so older slides don't crash on a missing field.
export function normalizeHeroSlide(slide: Partial<HeroSlide>): HeroSlide {
  return {
    imageUrl: slide.imageUrl ?? "",
    headline: slide.headline ?? "",
    position: slide.position ?? "bottom",
    overlay: slide.overlay ?? "medium",
    linkUrl: slide.linkUrl ?? "",
  };
}

export async function getShopSettings(): Promise<ShopSettings> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("shop_settings")
    .select(
      "bank_name, bank_account_name, bank_account_number, promptpay_qr_image_url, hero_slides, reviews_section_enabled",
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
    heroSlides: ((data.hero_slides as Partial<HeroSlide>[] | null) ?? []).map(normalizeHeroSlide),
    reviewsSectionEnabled: data.reviews_section_enabled ?? false,
  };
}
