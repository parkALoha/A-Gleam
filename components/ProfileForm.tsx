"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThaiAddressFields from "@/components/ThaiAddressFields";

type ProfileValues = {
  full_name: string;
  phone: string;
  address_line: string;
  subdistrict: string;
  district: string;
  province: string;
  postal_code: string;
};

export default function ProfileForm({
  initialValues,
  showWelcome,
}: {
  initialValues: ProfileValues;
  showWelcome: boolean;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialValues.full_name);
  const [phone, setPhone] = useState(initialValues.phone);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const form = e.currentTarget;

    const requiredFields = [
      { id: "province_select", message: "กรุณาเลือกจังหวัด" },
      { id: "district_select", message: "กรุณาเลือกอำเภอ/เขต" },
      { id: "subdistrict_select", message: "กรุณาเลือกตำบล/แขวง" },
      { id: "postal_code", message: "กรุณากรอกรหัสไปรษณีย์" },
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
        el.addEventListener("input", () => el.setCustomValidity(""), {
          once: true,
        });
        return;
      }
    }

    const formData = new FormData(form);
    const payload = {
      full_name: fullName,
      phone,
      address_line: String(formData.get("address_line") ?? ""),
      subdistrict: String(formData.get("subdistrict") ?? ""),
      district: String(formData.get("district") ?? ""),
      province: String(formData.get("province") ?? ""),
      postal_code: String(formData.get("postal_code") ?? ""),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/account/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "บันทึกไม่สำเร็จ");
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

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100"
    >
      {showWelcome && (
        <p className="rounded-xl bg-shop-blush-50 p-3 text-sm text-shop-blush-600">
          ยินดีต้อนรับ! กรอกเบอร์โทรไว้สักหน่อยนะ เผื่อมีคำสั่งซื้อเดิมที่เคยสั่งไว้แบบไม่ได้ล็อกอิน
          จะได้ผูกเข้าบัญชีนี้ให้อัตโนมัติ
        </p>
      )}

      <div>
        <label className="text-sm font-medium text-shop-text" htmlFor="full_name">
          ชื่อ-นามสกุล
        </label>
        <input
          id="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
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
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
          rows={2}
          defaultValue={initialValues.address_line}
          className="mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500"
        />
      </div>

      <ThaiAddressFields
        defaultNames={
          initialValues.province
            ? {
                province: initialValues.province,
                district: initialValues.district,
                subdistrict: initialValues.subdistrict,
                postalCode: initialValues.postal_code,
              }
            : undefined
        }
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      {success && showWelcome ? (
        <div className="rounded-xl bg-green-50 p-3 text-center">
          <p className="text-sm text-green-600">บันทึกสำเร็จ ขอบคุณครับ</p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-full bg-shop-blush-500 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
          >
            ไปช้อปต่อ
          </Link>
        </div>
      ) : (
        <>
          {success && <p className="text-sm text-green-600">บันทึกสำเร็จ</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-shop-blush-500 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </>
      )}
    </form>
  );
}
