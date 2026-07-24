import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import CreateAccountForm from "@/components/CreateAccountForm";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select("customer_phone, customer_id")
    .eq("order_number", orderNumber)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <p className="text-4xl">🎀</p>
      <h1 className="mt-4 text-2xl font-semibold text-shop-text">
        ขอบคุณสำหรับคำสั่งซื้อ
      </h1>
      <p className="mt-2 text-shop-text-soft">
        หมายเลขคำสั่งซื้อของคุณคือ
      </p>
      <p className="mt-1 text-lg font-semibold text-shop-blush-600">
        {orderNumber}
      </p>
      <p className="mt-4 text-sm text-shop-text-soft">
        ทางร้านกำลังตรวจสอบสลิปโอนเงินของคุณ
        เมื่อยืนยันแล้วจะรีบจัดส่งให้เร็วที่สุด
      </p>

      {order && !order.customer_id && (
        <div className="text-left">
          <CreateAccountForm
            orderNumber={orderNumber}
            phone={order.customer_phone}
          />
        </div>
      )}

      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-shop-blush-500 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105"
      >
        กลับหน้าแรก
      </Link>
    </div>
  );
}
