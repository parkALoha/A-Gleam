import { cache } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export type HeroOverlay = "light" | "medium" | "dark";

export type HeroLine = {
  text: string;
  /** Font size as cqw — % of the hero box's own width — so admins can pick
   * any value instead of a fixed set of presets. */
  size: number;
};

export type HeroSlide = {
  imageUrl: string;
  lines: HeroLine[];
  /** Percent (0-100) from the left/top where the text block is anchored. */
  positionX: number;
  positionY: number;
  overlay: HeroOverlay;
  /** Where "ช้อปเลย" goes — empty means the default "#products" scroll. */
  linkUrl: string;
};

// Rows saved while `size` was still a preset name ("sm"/"lg"/...) — map
// those onto roughly the same cqw values so old slides don't jump in size.
const LEGACY_TEXT_SIZE_PERCENT: Record<string, number> = {
  xs: 2,
  sm: 3,
  md: 5,
  lg: 7,
  xl: 9,
};

function normalizeHeroLineSize(size: unknown): number {
  if (typeof size === "number") return size;
  if (typeof size === "string") return LEGACY_TEXT_SIZE_PERCENT[size] ?? 5;
  return 5;
}

const DEFAULT_HERO_LINES: HeroLine[] = [
  { text: "Casual & Cuteness Everyday ☁️", size: LEGACY_TEXT_SIZE_PERCENT.sm },
  { text: "แต่งตัวให้น่ารักทุกวัน", size: LEGACY_TEXT_SIZE_PERCENT.lg },
];

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
  maintenanceMode: boolean;
};

// Rows saved before linkUrl/free-positioning existed won't have those
// fields in the stored jsonb — default them so older slides don't crash on
// a missing field.
export function normalizeHeroSlide(
  slide: Partial<HeroSlide> & { position?: string; headline?: string },
): HeroSlide {
  return {
    imageUrl: slide.imageUrl ?? "",
    // Rows saved before per-line text existed only have a single `headline`
    // string — rebuild it as the same two lines HeroBanner used to render
    // as fixed markup, so those slides keep their exact previous look.
    lines:
      slide.lines && slide.lines.length > 0
        ? slide.lines.map((line) => ({
            text: line.text ?? "",
            size: normalizeHeroLineSize(line.size),
          }))
        : slide.headline
          ? [DEFAULT_HERO_LINES[0], { text: slide.headline, size: LEGACY_TEXT_SIZE_PERCENT.lg }]
          : DEFAULT_HERO_LINES,
    positionX: slide.positionX ?? 50,
    positionY:
      slide.positionY ?? (slide.position ? LEGACY_POSITION_Y[slide.position] : 82),
    overlay: slide.overlay ?? "medium",
    linkUrl: slide.linkUrl ?? "",
  };
}

// Wrapped in React's cache() — with maintenance mode, both the (shop) and
// admin layouts now call this on every request in addition to the page
// itself, and this dedupes those into a single query per request.
export const getShopSettings = cache(async (): Promise<ShopSettings> => {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("shop_settings")
    .select(
      "bank_name, bank_account_name, bank_account_number, promptpay_qr_image_url, promptpay_id, hero_slides, reviews_section_enabled, maintenance_mode",
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
    maintenanceMode: data.maintenance_mode ?? false,
  };
});
