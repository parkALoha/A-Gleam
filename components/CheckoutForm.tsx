"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import ThaiAddressFields from "@/components/ThaiAddressFields";
import { PHONE_PATTERN } from "@/lib/form-validation";
import PromptPayQr from "@/components/PromptPayQr";
import type { ShopSettings } from "@/lib/shop-settings";

type CheckoutDefaultValues = {
  customer_name: string;
  customer_phone: string;
  address_line: string;
  subdistrict: string;
  district: string;
  province: string;
  postal_code: string;
};

export default function CheckoutForm({
  defaultValues,
  settings,
}: {
  defaultValues?: CheckoutDefaultValues;
  settings: ShopSettings;
}) {
  const router = useRouter();
  const { items, totalPrice, clearCart, hydrated } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);

  // Revoke the previous object URL whenever it's replaced or the form unmounts,
  // so we don't leak blob: URLs while the customer tries a few slip photos.
  useEffect(() => {
    return () => {
      if (slipPreview) URL.revokeObjectURL(slipPreview);
    };
  }, [slipPreview]);

  function handleSlipChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSlipFile(file);
    setSlipPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;

    const requiredFields: { id: string; message: string }[] = [
      { id: "customer_name", message: "กรุณากรอกชื่อ-นามสกุล" },
      { id: "customer_phone", message: "กรุณากรอกเบอร์โทร 10 หลักให้ถูกต้อง" },
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

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-white p-8 text-center ring-1 ring-shop-blush-100">
        <p className="font-medium text-shop-text">ตะกร้าว่างอยู่</p>
        <p className="mt-1 text-sm text-shop-text-soft">
          กลับไปเลือกสินค้าก่อนทำการชำระเงิน
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-full bg-shop-blush-500 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105"
        >
          เลือกซื้อสินค้า
        </Link>
      </div>
    );
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

      <div className="rounded-2xl bg-shop-beige-100 p-5">
        <p className="text-sm font-medium text-shop-text">
          โอนเงินตามยอดที่ต้องชำระ แล้วแนบรูปสลิปด้านล่าง
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          {settings.promptpayId ? (
            <div className="mx-auto sm:mx-0">
              <PromptPayQr promptPayId={settings.promptpayId} amount={totalPrice} />
            </div>
          ) : (
            settings.promptpayQrImageUrl && (
              <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-xl bg-white sm:mx-0">
                <Image
                  src={settings.promptpayQrImageUrl}
                  alt="QR พร้อมเพย์"
                  fill
                  sizes="160px"
                  className="object-contain p-2"
                />
              </div>
            )
          )}
          <div className="text-sm text-shop-text-soft">
            {settings.bankName && (
              <p>
                <span className="text-shop-text">ธนาคาร:</span> {settings.bankName}
              </p>
            )}
            {settings.bankAccountName && (
              <p>
                <span className="text-shop-text">ชื่อบัญชี:</span> {settings.bankAccountName}
              </p>
            )}
            {settings.bankAccountNumber && (
              <p>
                <span className="text-shop-text">เลขบัญชี:</span> {settings.bankAccountNumber}
              </p>
            )}
          </div>
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
          defaultValue={defaultValues?.customer_name}
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
          inputMode="numeric"
          pattern={PHONE_PATTERN}
          maxLength={10}
          required
          defaultValue={defaultValues?.customer_phone}
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
          defaultValue={defaultValues?.address_line}
          className="mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500"
        />
      </div>

      <ThaiAddressFields
        defaultNames={
          defaultValues
            ? {
                province: defaultValues.province,
                district: defaultValues.district,
                subdistrict: defaultValues.subdistrict,
                postalCode: defaultValues.postal_code,
              }
            : undefined
        }
      />

      <div>
        <label className="text-sm font-medium text-shop-text" htmlFor="slip">
          แนบรูปสลิปโอนเงิน
        </label>
        <div className="relative mt-1.5">
          <input
            id="slip"
            name="slip"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={handleSlipChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-shop-blush-200 bg-white px-4 py-3">
            {slipPreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob: preview, not an optimizable remote image
              <img
                src={slipPreview}
                alt=""
                className="h-12 w-12 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-shop-blush-50 text-shop-blush-400">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10.5M4 16.5l4.5-4.5a2 2 0 0 1 2.8 0L14 14.7m0 0 1.7-1.7a2 2 0 0 1 2.8 0L20 15M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5" />
                </svg>
              </span>
            )}
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium text-shop-text">
                {slipFile ? slipFile.name : "แตะเพื่อเลือกรูปสลิป"}
              </p>
              <p className="text-xs text-shop-text-soft">JPG, PNG หรือ WebP</p>
            </div>
            <span className="shrink-0 rounded-full bg-shop-blush-100 px-3 py-1.5 text-xs font-medium text-shop-blush-600">
              {slipFile ? "เปลี่ยนรูป" : "เลือกไฟล์"}
            </span>
          </div>
        </div>
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
