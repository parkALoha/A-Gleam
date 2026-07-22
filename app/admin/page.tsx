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
        <p className="mt-4 text-sm text-shop-text-soft">
          แผงควบคุมแอดมิน (จัดการสินค้า/ออเดอร์/ตั้งค่า) กำลังจะมาเร็วๆ นี้
        </p>
        <div className="mt-6">
          <AdminLogoutButton />
        </div>
      </div>
    </div>
  );
}
