import Link from "next/link";
import { getAdminSession } from "@/lib/auth";

export default async function AdminHomePage() {
  const user = await getAdminSession();

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="text-xl font-semibold text-shop-text">แดชบอร์ด</h1>
      <p className="mt-1 text-sm text-shop-text-soft">ยินดีต้อนรับ {user.email}</p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-shop-blush-100">
        <p className="font-medium text-shop-text">คำสั่งซื้อ</p>
        <p className="mt-1 text-sm text-shop-text-soft">
          ดูรายการคำสั่งซื้อ ตรวจสลิป และยืนยัน/ปฏิเสธออเดอร์
        </p>
        <Link
          href="/admin/orders"
          className="mt-4 inline-block rounded-full bg-shop-blush-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          จัดการคำสั่งซื้อ
        </Link>
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

      <p className="mt-4 text-sm text-shop-text-soft">
        แผงตั้งค่าอื่นๆ กำลังจะมาเร็วๆ นี้
      </p>
    </div>
  );
}
