import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import AdminLogoutButton from "@/components/AdminLogoutButton";

export default async function AdminHomePage() {
  const user = await getAdminSession();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-shop-blush-100">
        <h1 className="text-lg font-semibold text-shop-text">
          เข้าสู่ระบบสำเร็จ
        </h1>
        <p className="mt-1 text-sm text-shop-text-soft">
          ยินดีต้อนรับ {user.email}
        </p>
        <div className="mt-6">
          <Link
            href="/admin/orders"
            className="inline-block rounded-full bg-shop-blush-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
          >
            จัดการคำสั่งซื้อ
          </Link>
        </div>
        <p className="mt-4 text-sm text-shop-text-soft">
          แผงจัดการสินค้า/ตั้งค่า กำลังจะมาเร็วๆ นี้
        </p>
        <div className="mt-6">
          <AdminLogoutButton />
        </div>
      </div>
    </div>
  );
}
