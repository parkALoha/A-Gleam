import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import AccountLogoutButton from "@/components/AccountLogoutButton";

const STATUS_LABELS: Record<string, string> = {
  pending_verification: "รอตรวจสอบการชำระเงิน",
  confirmed: "ยืนยันคำสั่งซื้อแล้ว รอจัดส่ง",
  rejected: "การชำระเงินไม่ถูกต้อง กรุณาติดต่อร้าน",
};

export default async function AccountOrdersPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "order_number, status, total_amount, created_at, order_items(product_name, color_name, unit_price, quantity)",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-shop-text">
          ประวัติคำสั่งซื้อ
        </h1>
        <AccountLogoutButton />
      </div>

      {!orders || orders.length === 0 ? (
        <p className="mt-10 text-center text-shop-text-soft">
          ยังไม่มีคำสั่งซื้อ
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div
              key={order.order_number}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-shop-text">
                    {order.order_number}
                  </p>
                  <p className="text-xs text-shop-text-soft">
                    {new Date(order.created_at).toLocaleDateString("th-TH", {
                      dateStyle: "long",
                    })}
                  </p>
                </div>
                <span className="rounded-full bg-shop-blush-50 px-3 py-1 text-xs font-medium text-shop-blush-600">
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>

              <ul className="mt-3 space-y-1 border-t border-shop-blush-100 pt-3 text-sm text-shop-text-soft">
                {order.order_items.map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      {item.product_name} ({item.color_name}) × {item.quantity}
                    </span>
                    <span>{formatPrice(item.unit_price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t border-shop-blush-100 pt-2 text-sm font-semibold text-shop-text">
                <span>ยอดรวม</span>
                <span className="text-shop-blush-600">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
