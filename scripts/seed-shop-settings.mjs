import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

const { error } = await supabase
  .from("shop_settings")
  .update({
    bank_name: "ธนาคารตัวอย่าง (Mock)",
    bank_account_name: "บจก. อะ กลีม (ตัวอย่าง)",
    bank_account_number: "000-0-00000-0",
    promptpay_qr_image_url: "/mock-promptpay-qr.svg",
  })
  .eq("id", true);

if (error) {
  console.error("Update failed:", error.message);
  process.exit(1);
}

console.log("Shop settings updated with mock bank/QR info.");
