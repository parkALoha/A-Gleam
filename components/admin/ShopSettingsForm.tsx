"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import Select from "@/components/ui/Select";
import HeroBanner from "@/components/HeroBanner";
import type { HeroSlide } from "@/lib/shop-settings";
import { THAI_BANKS, bankNameForCode } from "@/lib/thai-banks";

const OVERLAY_OPTIONS: { value: HeroSlide["overlay"]; label: string }[] = [
  { value: "light", label: "อ่อน" },
  { value: "medium", label: "กลาง" },
  { value: "dark", label: "เข้ม" },
];

const CATEGORY_LINK_OPTIONS = [
  { value: "/collections/new", label: "สินค้าใหม่" },
  { value: "/collections/bestseller", label: "สินค้าขายดี" },
  { value: "/collections/sale", label: "SALE" },
  { value: "/collections/all", label: "สินค้าทั้งหมด" },
];

const SLIP_VERIFICATION_OPTIONS: {
  value: "manual" | "semi_auto" | "auto_confirm";
  label: string;
}[] = [
  { value: "manual", label: "Manual — แอดมินดูสลิปเองล้วนๆ" },
  { value: "semi_auto", label: "Semi-auto — ระบบตรวจให้ก่อน แต่แอดมินยังต้องกดยืนยันเอง (แนะนำ)" },
  { value: "auto_confirm", label: "Auto-confirm — ยอดตรงและไม่ซ้ำ ระบบยืนยันให้ทันที" },
];

export type ShopSettingsValues = {
  bankName: string;
  bankCode: string;
  bankAccountName: string;
  bankAccountNumber: string;
  promptpayId: string;
  promptpayQrImageUrl: string | null;
  heroSlides: HeroSlide[];
  reviewsSectionEnabled: boolean;
  slipVerificationMode: "manual" | "semi_auto" | "auto_confirm";
};

export default function ShopSettingsForm({
  initialValues,
  products,
}: {
  initialValues: ShopSettingsValues;
  products: { slug: string; name: string }[];
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
      { imageUrl: "", headline: "", positionX: 50, positionY: 82, overlay: "medium", linkUrl: "" },
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
          bankCode: values.bankCode,
          bankAccountName: values.bankAccountName,
          bankAccountNumber: values.bankAccountNumber,
          promptpayId: values.promptpayId,
          promptpayQrImageUrl: values.promptpayQrImageUrl,
          heroSlides: values.heroSlides,
          reviewsSectionEnabled: values.reviewsSectionEnabled,
          slipVerificationMode: values.slipVerificationMode,
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
            <label className="text-sm font-medium text-shop-text">ธนาคาร</label>
            <Select
              value={values.bankCode}
              onChange={(code) => {
                update("bankCode", code);
                update("bankName", bankNameForCode(code) ?? "");
              }}
              options={[
                { value: "", label: "เลือกธนาคาร" },
                ...THAI_BANKS.map((b) => ({ value: b.code, label: b.name })),
              ]}
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
          <label className="text-sm font-medium text-shop-text" htmlFor="promptpay_id">
            เลขพร้อมเพย์ (เบอร์โทร หรือเลขบัตรประชาชน)
          </label>
          <input
            id="promptpay_id"
            value={values.promptpayId}
            onChange={(e) => update("promptpayId", e.target.value)}
            placeholder="0812345678"
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-shop-text-soft">
            ใส่แล้วระบบจะสร้าง QR ใหม่ให้ตรงยอดทุกออเดอร์อัตโนมัติ ไม่ต้องใช้รูป QR ด้านล่าง
          </p>
        </div>

        <div className="mt-3">
          <p className="text-sm font-medium text-shop-text">
            รูป QR พร้อมเพย์ (ใช้เมื่อไม่ได้ใส่เลขพร้อมเพย์ด้านบน)
          </p>
          <div className="mt-1.5">
            <ImageUploader
              images={values.promptpayQrImageUrl ? [values.promptpayQrImageUrl] : []}
              onChange={(images) => update("promptpayQrImageUrl", images[0] ?? null)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <p className="font-medium text-shop-text">ตรวจสอบสลิปอัตโนมัติ (Slip2Go)</p>
        <p className="mt-1 text-xs text-shop-text-soft">
          เลือกว่าจะให้ระบบช่วยตรวจยอดเงินในสลิปแค่ไหน — สต็อกจะถูกตัดก็ต่อเมื่อออเดอร์ถูกยืนยันแล้วเท่านั้น
          ไม่ว่าจะยืนยันเองหรือระบบยืนยันให้อัตโนมัติ
        </p>
        <div className="mt-3">
          <Select
            value={values.slipVerificationMode}
            onChange={(value) =>
              update("slipVerificationMode", value as ShopSettingsValues["slipVerificationMode"])
            }
            options={SLIP_VERIFICATION_OPTIONS}
          />
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

              <div className="mt-3">
                <label className="text-xs text-shop-text-soft">
                  ตำแหน่งข้อความ — คลิกหรือลากบนภาพเพื่อวาง
                </label>
                <div className="mt-1.5 overflow-hidden rounded-lg ring-1 ring-shop-blush-100">
                  {slide.imageUrl ? (
                    <HeroBanner
                      slides={[slide]}
                      editable
                      onPositionChange={(positionX, positionY) =>
                        updateSlide(i, { positionX, positionY })
                      }
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-shop-beige-100 px-4 text-center text-xs text-shop-text-soft">
                      อัปโหลดรูปก่อนเพื่อดูตัวอย่างและวางตำแหน่งข้อความ
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs text-shop-text-soft">ความเข้มฉากหลัง</label>
                <Select
                  value={slide.overlay}
                  onChange={(value) =>
                    updateSlide(i, { overlay: value as HeroSlide["overlay"] })
                  }
                  options={OVERLAY_OPTIONS}
                />
              </div>

              <div className="mt-3">
                <label className="text-xs text-shop-text-soft">
                  ปุ่ม &quot;ช้อปเลย&quot; ไปที่
                </label>
                <Select
                  value={slide.linkUrl}
                  onChange={(value) => updateSlide(i, { linkUrl: value })}
                  options={[{ value: "", label: "ค่าเริ่มต้น (เลื่อนไปหมวดสินค้า)" }]}
                  groups={[
                    { label: "หมวดหมู่", options: CATEGORY_LINK_OPTIONS },
                    ...(products.length > 0
                      ? [
                          {
                            label: "สินค้า",
                            options: products.map((p) => ({
                              value: `/products/${p.slug}`,
                              label: p.name,
                            })),
                          },
                        ]
                      : []),
                  ]}
                />
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
