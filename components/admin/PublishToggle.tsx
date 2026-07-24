"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/useToast";

export default function PublishToggle({
  productId,
  isPublished,
}: {
  productId: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const { showToast, toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/toggle-publish`, {
        method: "POST",
      });
      if (!res.ok) {
        showToast("อัปเดตไม่สำเร็จ ลองใหม่อีกครั้ง");
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
      <button
        type="button"
        onClick={handleClick}
        disabled={submitting}
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          isPublished
            ? "bg-shop-blush-50 text-shop-blush-600 hover:bg-shop-blush-100"
            : "bg-shop-beige-100 text-shop-text-soft hover:bg-shop-blush-50"
        }`}
      >
        {isPublished ? "เผยแพร่อยู่" : "ซ่อนอยู่"}
      </button>
    </>
  );
}
