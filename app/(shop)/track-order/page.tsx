"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { thaiInvalidMessage, clearCustomValidity } from "@/lib/form-validation";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";

type OrderResult = {
  orderNumber: string;
  status: string;
  totalAmount: number;
  trackingNumber: string | null;
  createdAt: string;
  items: { product_name: string; color_name: string; unit_price: number; quantity: number }[];
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);

    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด");
        return;
      }
      setOrder(data.order);
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-10">
      <h1 className="text-2xl font-semibold text-shop-text">
        เช็คสถานะคำสั่งซื้อ
      </h1>
      <p className="mt-1 text-sm text-shop-text-soft">
        กรอกเลขคำสั่งซื้อและเบอร์โทรที่ใช้ตอนสั่งซื้อ ระบบจะแสดงสถานะให้
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100"
      >
        <div>
          <label className="text-sm font-medium text-shop-text" htmlFor="orderNumber">
            เลขคำสั่งซื้อ
          </label>
          <input
            id="orderNumber"
            type="text"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            onInvalid={thaiInvalidMessage}
            onInput={clearCustomValidity}
            placeholder="AG-20260101-XXXX"
            className="mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-shop-text" htmlFor="phone">
            เบอร์โทร
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onInvalid={thaiInvalidMessage}
            onInput={clearCustomValidity}
            className="mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-shop-blush-500 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "กำลังค้นหา..." : "เช็คสถานะ"}
        </button>
      </form>

      {order && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-shop-text">
                  {order.orderNumber}
                </p>
                <p className="text-xs text-shop-text-soft">
                  {new Date(order.createdAt).toLocaleDateString("th-TH", {
                    dateStyle: "long",
                  })}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-shop-blush-100 pt-4">
              <OrderStatusTimeline status={order.status} trackingNumber={order.trackingNumber} />
            </div>

            <ul className="mt-4 space-y-1 border-t border-shop-blush-100 pt-3 text-sm text-shop-text-soft">
              {order.items.map((item, i) => (
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
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
