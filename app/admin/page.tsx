import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import OrderStatusSummary from "@/components/OrderStatusSummary";

const ADMIN_SUMMARY_ITEMS = [
  { status: "pending_verification", icon: "pending", label: "รอตรวจสอบ" },
  { status: "confirmed", icon: "box", label: "รอจัดส่ง" },
  { status: "shipped", icon: "truck", label: "จัดส่งแล้ว" },
  { status: "returned", icon: "return", label: "ตีกลับ" },
] as const;

export default async function AdminHomePage() {
  const user = await getAdminSession();

  const supabase = createServiceClient();
  const { data: statusRows } = await supabase.from("orders").select("status");
  const counts: Record<string, number> = {};
  for (const row of statusRows ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="text-xl font-semibold text-shop-text">แดชบอร์ด</h1>
      <p className="mt-1 text-sm text-shop-text-soft">ยินดีต้อนรับ {user.email}</p>

      <div className="mt-6">
        <OrderStatusSummary
          title="คำสั่งซื้อของร้าน"
          baseHref="/admin/orders"
          items={[...ADMIN_SUMMARY_ITEMS]}
          counts={counts}
          viewAllHref="/admin/orders?status=all"
        />
      </div>

      <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-shop-blush-100">
        <p className="font-medium text-shop-text">สินค้า</p>
        <p className="mt-1 text-sm text-shop-text-soft">
          เพิ่ม/แก้ไขสินค้า สี สต็อก และรูปภาพ
        </p>
        <Link
          href="/admin/products"
          className="mt-4 inline-block rounded-full bg-shop-blush-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          จัดการสินค้า
        </Link>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-shop-blush-100">
        <p className="font-medium text-shop-text">ตั้งค่าร้าน</p>
        <p className="mt-1 text-sm text-shop-text-soft">
          บัญชีรับโอนเงิน, แบนเนอร์หน้าแรก, รีวิวลูกค้า
        </p>
        <Link
          href="/admin/settings"
          className="mt-4 inline-block rounded-full bg-shop-blush-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          ตั้งค่าร้าน
        </Link>
      </div>
    </div>
  );
}
