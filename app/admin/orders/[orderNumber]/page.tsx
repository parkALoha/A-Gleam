import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import OrderActions from "@/components/admin/OrderActions";

export default async function AdminOrderDetailPage({
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
      "order_number, customer_name, customer_phone, address_line, subdistrict, district, province, postal_code, total_amount, slip_image_path, status, admin_note, created_at, order_items(product_name, color_name, unit_price, quantity)",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) {
    notFound();
  }

  const { data: signedSlip } = await supabase.storage
    .from("payment-slips")
    .createSignedUrl(order.slip_image_path, 300);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="flex items-center justify-between">
        <Link href="/admin/orders" className="text-sm text-shop-text-soft hover:text-shop-blush-600">
          ← กลับไปหน้ารายการ
        </Link>
        <AdminLogoutButton />
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-shop-blush-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-shop-text">{order.order_number}</h1>
            <p className="mt-1 text-xs text-shop-text-soft">
              {new Date(order.created_at).toLocaleString("th-TH", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
          </div>
          <span className="rounded-full bg-shop-blush-50 px-3 py-1 text-xs font-medium text-shop-blush-600">
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>

        <div className="mt-4 border-t border-shop-blush-100 pt-4 text-sm text-shop-text">
          <p className="font-medium">{order.customer_name}</p>
          <p className="text-shop-text-soft">{order.customer_phone}</p>
          <p className="mt-1 text-shop-text-soft">
            {order.address_line} ต.{order.subdistrict} อ.{order.district} จ.{order.province}{" "}
            {order.postal_code}
          </p>
        </div>

        <ul className="mt-4 space-y-1 border-t border-shop-blush-100 pt-4 text-sm text-shop-text-soft">
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
          <span className="text-shop-blush-600">{formatPrice(order.total_amount)}</span>
        </div>

        {order.admin_note && (
          <p className="mt-4 rounded-xl bg-shop-beige-100 p-3 text-xs text-shop-text-soft">
            หมายเหตุ: {order.admin_note}
          </p>
        )}

        <div className="mt-4 border-t border-shop-blush-100 pt-4">
          <p className="text-sm font-medium text-shop-text">สลิปโอนเงิน</p>
          {signedSlip?.signedUrl ? (
            <a href={signedSlip.signedUrl} target="_blank" rel="noopener noreferrer">
              <Image
                src={signedSlip.signedUrl}
                alt="สลิปโอนเงิน"
                width={400}
                height={600}
                unoptimized
                className="mt-2 max-h-96 w-auto rounded-xl border border-shop-blush-100 object-contain"
              />
            </a>
          ) : (
            <p className="mt-2 text-sm text-red-500">ไม่พบรูปสลิป</p>
          )}
        </div>

        {order.status === "pending_verification" && (
          <OrderActions orderNumber={order.order_number} />
        )}
      </div>
    </div>
  );
}
