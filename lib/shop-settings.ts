import { createPublicSupabaseClient } from "@/lib/supabase/public";

export type HeroOverlay = "light" | "medium" | "dark";

export type HeroSlide = {
  imageUrl: string;
  headline: string;
  /** Percent (0-100) from the left/top where the text block is anchored. */
  positionX: number;
  positionY: number;
  overlay: HeroOverlay;
  /** Where "ช้อปเลย" goes — empty means the default "#products" scroll. */
  linkUrl: string;
};

// Rows saved before free positioning existed only have the old 3-value
// "top"/"center"/"bottom" enum — map it to a reasonable Y percent so those
// slides keep roughly the same look instead of jumping to the default.
const LEGACY_POSITION_Y: Record<string, number> = {
  top: 15,
  center: 50,
  bottom: 82,
};

export type ShopSettings = {
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  promptpayQrImageUrl: string | null;
  promptpayId: string | null;
  heroSlides: HeroSlide[];
  reviewsSectionEnabled: boolean;
};

// Rows saved before linkUrl/free-positioning existed won't have those
// fields in the stored jsonb — default them so older slides don't crash on
// a missing field.
export function normalizeHeroSlide(
  slide: Partial<HeroSlide> & { position?: string },
): HeroSlide {
  return {
    imageUrl: slide.imageUrl ?? "",
    headline: slide.headline ?? "",
    positionX: slide.positionX ?? 50,
    positionY:
      slide.positionY ?? (slide.position ? LEGACY_POSITION_Y[slide.position] : 82),
    overlay: slide.overlay ?? "medium",
    linkUrl: slide.linkUrl ?? "",
  };
}

export async function getShopSettings(): Promise<ShopSettings> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("shop_settings")
    .select(
      "bank_name, bank_account_name, bank_account_number, promptpay_qr_image_url, promptpay_id, hero_slides, reviews_section_enabled",
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
    promptpayId: data.promptpay_id,
    heroSlides: ((data.hero_slides as Partial<HeroSlide>[] | null) ?? []).map(normalizeHeroSlide),
    reviewsSectionEnabled: data.reviews_section_enabled ?? false,
  };
}
