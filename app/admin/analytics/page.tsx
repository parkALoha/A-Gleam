import { getAdminSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { formatPrice } from "@/lib/format";

const SALES_STATUSES = ["confirmed", "shipped", "delivered"];
const DAYS = 30;
const LOW_STOCK_THRESHOLD = 5;

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

// Supabase's inferred type for a to-one embed (via the product_variants ->
// products FK) is an array, but the actual response at runtime is a single
// object — same mismatch handled elsewhere (see admin/settings/page.tsx).
type ProductRef = { name: string; slug: string; is_published: boolean } | null;
function getProduct(
  products: ProductRef | ProductRef[] | null,
): ProductRef {
  if (!products) return null;
  return Array.isArray(products) ? (products[0] ?? null) : products;
}

export default async function AdminAnalyticsPage() {
  await getAdminSession();

  const supabase = createServiceClient();

  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - (DAYS - 1));
  rangeStart.setHours(0, 0, 0, 0);

  const [{ data: salesOrders }, { data: itemRows }, { data: lowStockVariants }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("created_at, total_amount")
        .in("status", SALES_STATUSES)
        .gte("created_at", rangeStart.toISOString()),
      supabase
        .from("order_items")
        .select("product_name, quantity, orders!inner(status)")
        .in("orders.status", SALES_STATUSES),
      supabase
        .from("product_variants")
        .select("color_name, stock_quantity, products(name, slug, is_published)")
        .lte("stock_quantity", LOW_STOCK_THRESHOLD)
        .order("stock_quantity", { ascending: true })
        .limit(20),
    ]);

  // Daily sales — fill every day in range so quiet days show as zero, not a gap.
  const dailyTotals = new Map<string, number>();
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    dailyTotals.set(dateKey(d), 0);
  }
  for (const order of salesOrders ?? []) {
    const key = dateKey(new Date(order.created_at));
    dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + Number(order.total_amount));
  }
  const dailyEntries = Array.from(dailyTotals.entries());
  const maxDaily = Math.max(1, ...dailyEntries.map(([, v]) => v));
  const totalSales = dailyEntries.reduce((sum, [, v]) => sum + v, 0);
  const orderCount = (salesOrders ?? []).length;

  // Top products by quantity sold.
  const qtyByProduct = new Map<string, number>();
  for (const row of itemRows ?? []) {
    qtyByProduct.set(row.product_name, (qtyByProduct.get(row.product_name) ?? 0) + row.quantity);
  }
  const topProducts = Array.from(qtyByProduct.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const maxQty = Math.max(1, ...topProducts.map(([, q]) => q));

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="text-xl font-semibold text-shop-text">วิเคราะห์ข้อมูล</h1>
      <p className="mt-1 text-sm text-shop-text-soft">
        นับเฉพาะออเดอร์ที่ยืนยันแล้ว (รอจัดส่ง/จัดส่งแล้ว/จัดส่งสำเร็จ) ไม่รวมออเดอร์ที่ยังรอตรวจสอบหรือถูกปฏิเสธ
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
          <p className="text-xs text-shop-text-soft">ยอดขายรวม {DAYS} วันล่าสุด</p>
          <p className="mt-1 text-2xl font-semibold text-shop-blush-600">
            {formatPrice(totalSales)}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
          <p className="text-xs text-shop-text-soft">จำนวนออเดอร์ {DAYS} วันล่าสุด</p>
          <p className="mt-1 text-2xl font-semibold text-shop-text">{orderCount} รายการ</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <p className="font-medium text-shop-text">ยอดขายรายวัน ({DAYS} วันล่าสุด)</p>
        <div className="mt-4 flex h-40 items-end gap-[3px] overflow-x-auto pb-1">
          {dailyEntries.map(([key, amount]) => (
            <div
              key={key}
              title={`${new Date(key).toLocaleDateString("th-TH", { dateStyle: "medium" })}: ${formatPrice(amount)}`}
              className="w-3 shrink-0 rounded-t bg-shop-blush-300 transition-colors hover:bg-shop-blush-500"
              style={{ height: `${Math.max(2, (amount / maxDaily) * 100)}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-shop-text-soft">
          <span>{new Date(rangeStart).toLocaleDateString("th-TH", { dateStyle: "medium" })}</span>
          <span>วันนี้</span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <p className="font-medium text-shop-text">สินค้าขายดี Top 10</p>
        {topProducts.length === 0 ? (
          <p className="mt-3 text-sm text-shop-text-soft">ยังไม่มีออเดอร์ที่ยืนยันแล้ว</p>
        ) : (
          <div className="mt-4 space-y-2.5">
            {topProducts.map(([name, qty]) => (
              <div key={name} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 truncate text-shop-text">{name}</span>
                <div className="h-2.5 flex-1 rounded-full bg-shop-beige-100">
                  <div
                    className="h-2.5 rounded-full bg-shop-blush-500"
                    style={{ width: `${(qty / maxQty) * 100}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-shop-text-soft">{qty} ชิ้น</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <p className="font-medium text-shop-text">สต็อกใกล้หมด (เหลือ ≤ {LOW_STOCK_THRESHOLD} ชิ้น)</p>
        {!lowStockVariants || lowStockVariants.length === 0 ? (
          <p className="mt-3 text-sm text-shop-text-soft">ไม่มีสีไหนสต็อกใกล้หมด</p>
        ) : (
          <ul className="mt-3 divide-y divide-shop-blush-100">
            {lowStockVariants.map((v, i) => {
              const product = getProduct(v.products);
              return (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="text-shop-text">
                  {product?.name ?? "-"} ({v.color_name})
                  {product && !product.is_published && (
                    <span className="ml-2 text-xs text-shop-text-soft">(ไม่เผยแพร่)</span>
                  )}
                </span>
                <span
                  className={`font-medium ${v.stock_quantity === 0 ? "text-red-500" : "text-amber-600"}`}
                >
                  เหลือ {v.stock_quantity} ชิ้น
                </span>
              </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
