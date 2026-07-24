import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

const TABS = [
  { status: "pending_verification", label: "รอตรวจสอบ" },
  { status: "confirmed", label: "ยืนยันแล้ว" },
  { status: "rejected", label: "ปฏิเสธแล้ว" },
  { status: "all", label: "ทั้งหมด" },
] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await getAdminSession();
  const { status } = await searchParams;
  const activeStatus = status ?? "pending_verification";

  const supabase = createServiceClient();
  let query = supabase
    .from("orders")
    .select("order_number, customer_name, customer_phone, total_amount, status, created_at")
    .order("created_at", { ascending: false });

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  const { data: orders } = await query;

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="text-xl font-semibold text-shop-text">จัดการคำสั่งซื้อ</h1>

      <div className="mt-6 flex gap-2 rounded-full bg-shop-blush-50 p-1 text-sm font-medium">
        {TABS.map((tab) => (
          <Link
            key={tab.status}
            href={`/admin/orders?status=${tab.status}`}
            className={`flex-1 rounded-full py-2 text-center transition-colors ${
              activeStatus === tab.status
                ? "bg-white text-shop-blush-600 shadow-sm"
                : "text-shop-text-soft hover:text-shop-text"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {!orders || orders.length === 0 ? (
        <p className="mt-10 text-center text-shop-text-soft">ไม่มีคำสั่งซื้อในหมวดนี้</p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.order_number}
              href={`/admin/orders/${order.order_number}`}
              className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100 transition-colors hover:bg-shop-blush-50/50"
            >
              <div>
                <p className="font-semibold text-shop-text">{order.order_number}</p>
                <p className="text-sm text-shop-text-soft">
                  {order.customer_name} · {order.customer_phone}
                </p>
                <p className="mt-0.5 text-xs text-shop-text-soft">
                  {new Date(order.created_at).toLocaleString("th-TH", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-shop-blush-600">
                  {formatPrice(order.total_amount)}
                </p>
                <span className="mt-1 inline-block rounded-full bg-shop-blush-50 px-3 py-1 text-xs font-medium text-shop-blush-600">
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
