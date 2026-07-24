"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/useToast";
import Select from "@/components/ui/Select";

const TAG_OPTIONS = [
  { value: "", label: "ไม่มีป้าย" },
  { value: "ใหม่", label: "ใหม่" },
  { value: "ขายดี", label: "ขายดี" },
  { value: "ลดราคา", label: "ลดราคา" },
  { value: "ตำหนิ", label: "ตำหนิ" },
];

export default function TagQuickSelect({
  productId,
  tag,
}: {
  productId: string;
  tag: string | null;
}) {
  const router = useRouter();
  const { showToast, toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleChange(value: string) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/tag`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: value || null }),
      });
      if (!res.ok) {
        showToast("อัปเดตป้ายไม่สำเร็จ ลองใหม่อีกครั้ง");
        return;
      }
      router.refresh();
    } catch {
      showToast("เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {toast}
      <div
        className="shrink-0"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Select
          value={tag ?? ""}
          onChange={handleChange}
          disabled={submitting}
          buttonClassName="flex items-center justify-between gap-2 rounded-full border border-shop-blush-200 bg-white px-3 py-1 text-left text-xs font-medium text-shop-text outline-none focus:border-shop-blush-500 disabled:cursor-not-allowed disabled:opacity-60"
          options={TAG_OPTIONS}
        />
      </div>
    </>
  );
}
