"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import type { HeroSlide } from "@/lib/shop-settings";

const POSITION_OPTIONS: { value: HeroSlide["position"]; label: string }[] = [
  { value: "top", label: "บน" },
  { value: "center", label: "กลาง" },
  { value: "bottom", label: "ล่าง" },
];

const OVERLAY_OPTIONS: { value: HeroSlide["overlay"]; label: string }[] = [
  { value: "light", label: "อ่อน" },
  { value: "medium", label: "กลาง" },
  { value: "dark", label: "เข้ม" },
];

export type ShopSettingsValues = {
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  promptpayQrImageUrl: string | null;
  heroSlides: HeroSlide[];
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

  function addSlide() {
    update("heroSlides", [
      ...values.heroSlides,
      { imageUrl: "", headline: "", position: "bottom", overlay: "medium" },
    ]);
  }

  function updateSlide(index: number, patch: Partial<HeroSlide>) {
    update(
      "heroSlides",
      values.heroSlides.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  }

  function removeSlide(index: number) {
    update(
      "heroSlides",
      values.heroSlides.filter((_, i) => i !== index),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (values.heroSlides.some((s) => !s.imageUrl)) {
      setError("กรุณาแนบรูปให้ครบทุกสไลด์ (หรือลบสไลด์ที่ยังไม่มีรูปออก)");
      return;
    }

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
          heroSlides: values.heroSlides,
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
        <div className="flex items-center justify-between">
          <p className="font-medium text-shop-text">แบนเนอร์หน้าแรก (Hero)</p>
          <button
            type="button"
            onClick={addSlide}
            className="rounded-full border border-shop-blush-200 px-4 py-1.5 text-sm font-medium text-shop-text hover:bg-shop-blush-50"
          >
            + เพิ่มสไลด์
          </button>
        </div>
        <p className="mt-1 text-xs text-shop-text-soft">
          แต่ละสไลด์ตั้งข้อความ ตำแหน่งข้อความ และความเข้มของฉากหลังแยกกันได้ — ถ้ามีหลายสไลด์จะเลื่อนสลับกันเอง
        </p>

        {values.heroSlides.length === 0 && (
          <p className="mt-3 text-sm text-shop-text-soft">
            ยังไม่มีสไลด์ — กด &quot;+ เพิ่มสไลด์&quot;
          </p>
        )}

        <div className="mt-3 space-y-4">
          {values.heroSlides.map((slide, i) => (
            <div key={i} className="rounded-xl border border-shop-blush-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-shop-text">สไลด์ที่ {i + 1}</p>
                <button
                  type="button"
                  onClick={() => removeSlide(i)}
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  ลบสไลด์นี้
                </button>
              </div>

              <div className="mt-2">
                <label className="text-xs text-shop-text-soft">รูปภาพ</label>
                <div className="mt-1.5">
                  <ImageUploader
                    images={slide.imageUrl ? [slide.imageUrl] : []}
                    onChange={(images) => updateSlide(i, { imageUrl: images[0] ?? "" })}
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs text-shop-text-soft">ข้อความหัวข้อ</label>
                <input
                  value={slide.headline}
                  onChange={(e) => updateSlide(i, { headline: e.target.value })}
                  placeholder="แต่งตัวให้น่ารักทุกวัน"
                  className={fieldClass}
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-shop-text-soft">ตำแหน่งข้อความ</label>
                  <select
                    value={slide.position}
                    onChange={(e) =>
                      updateSlide(i, { position: e.target.value as HeroSlide["position"] })
                    }
                    className={fieldClass}
                  >
                    {POSITION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-shop-text-soft">ความเข้มฉากหลัง</label>
                  <select
                    value={slide.overlay}
                    onChange={(e) =>
                      updateSlide(i, { overlay: e.target.value as HeroSlide["overlay"] })
                    }
                    className={fieldClass}
                  >
                    {OVERLAY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
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
