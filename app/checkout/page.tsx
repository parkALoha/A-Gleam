import Image from "next/image";
import { getShopSettings } from "@/lib/shop-settings";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage() {
  const settings = await getShopSettings();

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

      <CheckoutForm />
    </div>
  );
}
