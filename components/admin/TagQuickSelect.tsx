"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [submitting, setSubmitting] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation();
    setSubmitting(true);
    try {
      await fetch(`/api/admin/products/${productId}/tag`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: e.target.value || null }),
      });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <select
      value={tag ?? ""}
      onClick={(e) => e.stopPropagation()}
      onChange={handleChange}
      disabled={submitting}
      className="shrink-0 rounded-full border border-shop-blush-200 bg-white px-3 py-1 text-xs font-medium text-shop-text outline-none focus:border-shop-blush-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {TAG_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
