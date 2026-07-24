import { getAdminSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import ShopSettingsForm from "@/components/admin/ShopSettingsForm";
import ReviewManager from "@/components/admin/ReviewManager";

export default async function AdminSettingsPage() {
  await getAdminSession();

  const supabase = createServiceClient();
  const [{ data: settings }, { data: reviews }] = await Promise.all([
    supabase
      .from("shop_settings")
      .select(
        "bank_name, bank_account_name, bank_account_number, promptpay_qr_image_url, hero_image_urls, hero_headline, reviews_section_enabled",
      )
      .single(),
    supabase
      .from("reviews")
      .select("id, customer_handle, image_url, caption, rating, is_visible")
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="text-xl font-semibold text-shop-text">ตั้งค่าร้าน</h1>

      <div className="mt-6">
        <ShopSettingsForm
          initialValues={{
            bankName: settings?.bank_name ?? "",
            bankAccountName: settings?.bank_account_name ?? "",
            bankAccountNumber: settings?.bank_account_number ?? "",
            promptpayQrImageUrl: settings?.promptpay_qr_image_url ?? null,
            heroImageUrls: settings?.hero_image_urls ?? [],
            heroHeadline: settings?.hero_headline ?? "",
            reviewsSectionEnabled: settings?.reviews_section_enabled ?? false,
          }}
        />
      </div>

      <div className="mt-6">
        <ReviewManager
          reviews={(reviews ?? []).map((r) => ({
            id: r.id,
            customerHandle: r.customer_handle,
            imageUrl: r.image_url,
            caption: r.caption,
            rating: r.rating,
            isVisible: r.is_visible,
          }))}
        />
      </div>
    </div>
  );
}
