import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import Pagination from "@/components/admin/Pagination";
import OrderSearch from "@/components/admin/OrderSearch";

const PAGE_SIZE = 20;

const TABS = [
  { status: "pending_verification", label: "รอตรวจสอบ" },
  { status: "confirmed", label: "รอจัดส่ง" },
  { status: "shipped", label: "จัดส่งแล้ว" },
  { status: "delivered", label: "จัดส่งสำเร็จ" },
  { status: "returned", label: "ตีกลับ" },
  { status: "rejected", label: "ปฏิเสธแล้ว" },
  { status: "all", label: "ทั้งหมด" },
] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>;
}) {
  await getAdminSession();
  const { status, page: pageParam, q } = await searchParams;
  const activeStatus = status ?? "pending_verification";
  const query = q?.trim() ?? "";
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createServiceClient();
  let ordersQuery = supabase
    .from("orders")
    .select("order_number, customer_name, customer_phone, total_amount, status, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (activeStatus !== "all") {
    ordersQuery = ordersQuery.eq("status", activeStatus);
  }

  if (query) {
    // Strip characters that have special meaning in PostgREST's or() filter
    // syntax (commas separate conditions, parens group them) so a search
    // term containing them can't break or redefine the filter structure.
    const safeQuery = query.replace(/[,()]/g, "");
    ordersQuery = ordersQuery.or(
      `order_number.ilike.%${safeQuery}%,customer_name.ilike.%${safeQuery}%,customer_phone.ilike.%${safeQuery}%`,
    );
  }

  const { data: orders, count, error } = await ordersQuery;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="text-xl font-semibold text-shop-text">จัดการคำสั่งซื้อ</h1>

      <div className="sticky top-0 z-10 -mx-8 mt-6 flex flex-wrap gap-2 bg-shop-cream px-8 py-3 text-sm font-medium">
        {TABS.map((tab) => (
          <Link
            key={tab.status}
            href={`/admin/orders?status=${tab.status}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            className={`whitespace-nowrap rounded-full px-4 py-2 transition-colors ${
              activeStatus === tab.status
                ? "bg-shop-blush-500 text-white shadow-sm"
                : "bg-white text-shop-text-soft ring-1 ring-shop-blush-100 hover:bg-shop-blush-50"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <OrderSearch defaultValue={query} status={activeStatus} />

      {error ? (
        <p className="mt-10 text-center text-sm text-red-500">
          โหลดรายการคำสั่งซื้อไม่สำเร็จ ลองรีเฟรชหน้านี้อีกครั้ง
        </p>
      ) : !orders || orders.length === 0 ? (
        <p className="mt-10 text-center text-shop-text-soft">
          {query ? `ไม่พบคำสั่งซื้อที่ตรงกับ "${query}"` : "ไม่มีคำสั่งซื้อในหมวดนี้"}
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.order_number}
              href={`/admin/orders/${order.order_number}`}
              className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100 transition-colors hover:bg-shop-blush-50/50"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-shop-text">{order.order_number}</p>
                <span className="shrink-0 whitespace-nowrap rounded-full bg-shop-blush-50 px-3 py-1 text-xs font-medium text-shop-blush-600">
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-shop-text-soft">
                {order.customer_name} · {order.customer_phone}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-shop-blush-100 pt-3">
                <p className="text-xs text-shop-text-soft">
                  {new Date(order.created_at).toLocaleString("th-TH", {
                    dateStyle: "long",
                    timeStyle: "short",
                    timeZone: "Asia/Bangkok",
                  })}
                </p>
                <p className="font-semibold text-shop-blush-600">
                  {formatPrice(order.total_amount)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(p) =>
          `/admin/orders?status=${activeStatus}&page=${p}${query ? `&q=${encodeURIComponent(query)}` : ""}`
        }
      />
    </div>
  );
}
