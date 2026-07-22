"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import ThaiAddressFields from "@/components/ThaiAddressFields";

export default function CheckoutForm() {
  const router = useRouter();
  const { items, totalPrice, clearCart, hydrated } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;

    const requiredFields: { id: string; message: string }[] = [
      { id: "customer_name", message: "กรุณากรอกชื่อ-นามสกุล" },
      { id: "customer_phone", message: "กรุณากรอกเบอร์โทรศัพท์" },
      { id: "address_line", message: "กรุณากรอกที่อยู่ (บ้านเลขที่ / ถนน / หมู่บ้าน)" },
      { id: "province_select", message: "กรุณาเลือกจังหวัด" },
      { id: "district_select", message: "กรุณาเลือกอำเภอ/เขต" },
      { id: "subdistrict_select", message: "กรุณาเลือกตำบล/แขวง" },
      { id: "postal_code", message: "กรุณากรอกรหัสไปรษณีย์" },
      { id: "slip", message: "กรุณาแนบรูปสลิปโอนเงิน" },
    ];

    for (const field of requiredFields) {
      const el = document.getElementById(field.id) as
        | HTMLInputElement
        | HTMLSelectElement
        | null;
      if (el && !el.validity.valid) {
        el.setCustomValidity(field.message);
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.reportValidity();
        const clearCustomValidity = () => el.setCustomValidity("");
        el.addEventListener("input", clearCustomValidity, { once: true });
        el.addEventListener("change", clearCustomValidity, { once: true });
        setError(field.message);
        return;
      }
    }

    if (items.length === 0) {
      setError("ตะกร้าว่างอยู่");
      return;
    }

    const formData = new FormData(form);
    formData.set(
      "items",
      JSON.stringify(
        items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      ),
    );

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/checkout/confirmation/${data.orderNumber}`);
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง");
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
      <div className="rounded-2xl bg-white p-5 ring-1 ring-shop-blush-100">
        <p className="font-medium text-shop-text">สรุปรายการ</p>
        <ul className="mt-3 space-y-1.5 text-sm text-shop-text-soft">
          {items.map((item) => (
            <li key={item.lineId} className="flex justify-between">
              <span>
                {item.name} ({item.colorName}) × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-shop-blush-100 pt-3 font-semibold text-shop-text">
          <span>ยอดรวม</span>
          <span className="text-shop-blush-600">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-shop-text" htmlFor="customer_name">
          ชื่อ-นามสกุล
        </label>
        <input
          id="customer_name"
          name="customer_name"
          required
          className="mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-shop-text" htmlFor="customer_phone">
          เบอร์โทร
        </label>
        <input
          id="customer_phone"
          name="customer_phone"
          type="tel"
          required
          className="mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-shop-text" htmlFor="address_line">
          ที่อยู่ (บ้านเลขที่ / ถนน / หมู่บ้าน)
        </label>
        <textarea
          id="address_line"
          name="address_line"
          required
          rows={2}
          className="mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500"
        />
      </div>

      <ThaiAddressFields />

      <div>
        <label className="text-sm font-medium text-shop-text" htmlFor="slip">
          แนบรูปสลิปโอนเงิน
        </label>
        <input
          id="slip"
          name="slip"
          type="file"
          accept="image/*"
          required
          className="mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text file:mr-3 file:rounded-full file:border-0 file:bg-shop-blush-100 file:px-3 file:py-1.5 file:text-shop-blush-600"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-shop-blush-500 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "กำลังส่งคำสั่งซื้อ..." : "ยืนยันคำสั่งซื้อ"}
      </button>
    </form>
  );
}
