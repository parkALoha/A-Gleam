"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";

export type ShopSettingsValues = {
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  promptpayQrImageUrl: string | null;
  heroImageUrls: string[];
  heroHeadline: string;
  reviewsSectionEnabled: boolean;
};

export default function ShopSettingsForm({
  initialValues,
}: {
  initialValues: ShopSettingsValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function update<K extends keyof ShopSettingsValues>(key: K, value: ShopSettingsValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: values.bankName,
          bankAccountName: values.bankAccountName,
          bankAccountNumber: values.bankAccountNumber,
          promptpayQrImageUrl: values.promptpayQrImageUrl,
          heroImageUrls: values.heroImageUrls,
          heroHeadline: values.heroHeadline,
          reviewsSectionEnabled: values.reviewsSectionEnabled,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? `บันทึกไม่สำเร็จ (${res.status})`);
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <p className="font-medium text-shop-text">บัญชีรับโอนเงิน</p>
        <p className="mt-1 text-xs text-shop-text-soft">
          ข้อมูลนี้จะแสดงให้ลูกค้าเห็นตอนหน้าชำระเงิน
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-shop-text" htmlFor="bank_name">
              ธนาคาร
            </label>
            <input
              id="bank_name"
              value={values.bankName}
              onChange={(e) => update("bankName", e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-shop-text" htmlFor="bank_account_name">
              ชื่อบัญชี
            </label>
            <input
              id="bank_account_name"
              value={values.bankAccountName}
              onChange={(e) => update("bankAccountName", e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="text-sm font-medium text-shop-text" htmlFor="bank_account_number">
            เลขบัญชี
          </label>
          <input
            id="bank_account_number"
            value={values.bankAccountNumber}
            onChange={(e) => update("bankAccountNumber", e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="mt-3">
          <p className="text-sm font-medium text-shop-text">รูป QR พร้อมเพย์</p>
          <div className="mt-1.5">
            <ImageUploader
              images={values.promptpayQrImageUrl ? [values.promptpayQrImageUrl] : []}
              onChange={(images) => update("promptpayQrImageUrl", images[0] ?? null)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <p className="font-medium text-shop-text">แบนเนอร์หน้าแรก (Hero)</p>

        <div className="mt-4">
          <label className="text-sm font-medium text-shop-text" htmlFor="hero_headline">
            หัวข้อ
          </label>
          <input
            id="hero_headline"
            value={values.heroHeadline}
            onChange={(e) => update("heroHeadline", e.target.value)}
            placeholder="แต่งตัวให้น่ารักทุกวัน"
            className={fieldClass}
          />
        </div>

        <div className="mt-3">
          <p className="text-sm font-medium text-shop-text">รูปแบนเนอร์ (เลื่อนได้หลายรูป)</p>
          <div className="mt-1.5">
            <ImageUploader
              images={values.heroImageUrls}
              onChange={(images) => update("heroImageUrls", images)}
              multiple
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <label className="flex items-center gap-2 text-sm text-shop-text">
          <input
            type="checkbox"
            checked={values.reviewsSectionEnabled}
            onChange={(e) => update("reviewsSectionEnabled", e.target.checked)}
          />
          แสดงส่วนรีวิวลูกค้าที่หน้าแรก
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">บันทึกสำเร็จ</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-shop-blush-500 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>
    </form>
  );
}
