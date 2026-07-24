import Image from "next/image";
import { getShopSettings } from "@/lib/shop-settings";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage() {
  const settings = await getShopSettings();

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultValues;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "full_name, phone, address_line, subdistrict, district, province, postal_code",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.address_line) {
      defaultValues = {
        customer_name: profile.full_name ?? "",
        customer_phone: profile.phone ?? "",
        address_line: profile.address_line,
        subdistrict: profile.subdistrict ?? "",
        district: profile.district ?? "",
        province: profile.province ?? "",
        postal_code: profile.postal_code ?? "",
      };
    } else {
      // No saved profile address yet — fall back to their last order.
      const { data: lastOrder } = await supabase
        .from("orders")
        .select(
          "customer_name, customer_phone, address_line, subdistrict, district, province, postal_code",
        )
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      defaultValues = lastOrder ?? undefined;
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-2xl font-semibold text-shop-text">ชำระเงิน</h1>

      <div className="mt-6 rounded-2xl bg-shop-beige-100 p-5">
        <p className="text-sm font-medium text-shop-text">
          โอนเงินตามยอดที่ต้องชำระ แล้วแนบรูปสลิปด้านล่าง
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          {settings.promptpayQrImageUrl && (
            <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-xl bg-white sm:mx-0">
              <Image
                src={settings.promptpayQrImageUrl}
                alt="QR พร้อมเพย์"
                fill
                unoptimized
                className="object-contain p-2"
              />
            </div>
          )}
          <div className="text-sm text-shop-text-soft">
            {settings.bankName && (
              <p>
                <span className="text-shop-text">ธนาคาร:</span>{" "}
                {settings.bankName}
              </p>
            )}
            {settings.bankAccountName && (
              <p>
                <span className="text-shop-text">ชื่อบัญชี:</span>{" "}
                {settings.bankAccountName}
              </p>
            )}
            {settings.bankAccountNumber && (
              <p>
                <span className="text-shop-text">เลขบัญชี:</span>{" "}
                {settings.bankAccountNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      <CheckoutForm defaultValues={defaultValues} />
    </div>
  );
}
