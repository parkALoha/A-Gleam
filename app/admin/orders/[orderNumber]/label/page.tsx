import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import PrintButton from "@/components/admin/PrintButton";

export default async function AdminOrderLabelPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  await getAdminSession();
  const { orderNumber } = await params;

  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "order_number, customer_name, customer_phone, address_line, subdistrict, district, province, postal_code, tracking_number",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order || !order.tracking_number) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md px-8 py-10">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/admin/orders/${order.order_number}`}
          className="text-sm text-shop-text-soft hover:text-shop-blush-600"
        >
          ← กลับไปหน้าออเดอร์
        </Link>
        <PrintButton />
      </div>

      <div className="mt-6 rounded-2xl border-2 border-dashed border-shop-text p-6 print:mt-0 print:rounded-none print:border-black">
        <p className="text-center text-xs font-bold tracking-widest text-red-500">
          ตัวอย่าง (MOCK) — ไม่ใช่ label จริงจาก Flash Express
        </p>

        <div className="mt-4 border-b border-shop-text pb-3">
          <p className="text-xs text-shop-text-soft">ผู้ส่ง</p>
          <p className="font-semibold text-shop-text">A GLEAM | อะ - กลีม</p>
        </div>

        <div className="mt-3 border-b border-shop-text pb-3">
          <p className="text-xs text-shop-text-soft">ผู้รับ</p>
          <p className="font-semibold text-shop-text">{order.customer_name}</p>
          <p className="text-shop-text">{order.customer_phone}</p>
          <p className="text-shop-text">
            {order.address_line} ต.{order.subdistrict} อ.{order.district} จ.{order.province}{" "}
            {order.postal_code}
          </p>
        </div>

        <div className="mt-3">
          <p className="text-xs text-shop-text-soft">เลขที่ออเดอร์</p>
          <p className="font-medium text-shop-text">{order.order_number}</p>
          <p className="mt-2 text-xs text-shop-text-soft">เลขพัสดุ (Mock)</p>
          <p className="font-mono text-lg font-bold tracking-wider text-shop-text">
            {order.tracking_number}
          </p>
        </div>
      </div>
    </div>
  );
}
