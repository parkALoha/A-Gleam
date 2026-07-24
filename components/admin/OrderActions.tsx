"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderActions({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectNote, setShowRejectNote] = useState(false);
  const [note, setNote] = useState("");

  async function handleConfirm() {
    if (!confirm("ยืนยันคำสั่งซื้อนี้? สต็อกสินค้าจะถูกตัดทันที")) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}/confirm`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด");
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด");
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!showRejectNote ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 rounded-full bg-shop-blush-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            ยืนยันคำสั่งซื้อ
          </button>
          <button
            type="button"
            onClick={() => setShowRejectNote(true)}
            disabled={submitting}
            className="flex-1 rounded-full border border-red-200 px-6 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            ปฏิเสธคำสั่งซื้อ
          </button>
        </div>
      ) : (
        <div className="space-y-2 rounded-xl border border-red-100 p-4">
          <label className="text-sm font-medium text-shop-text" htmlFor="reject_note">
            หมายเหตุภายใน (ไม่บังคับ)
          </label>
          <textarea
            id="reject_note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReject}
              disabled={submitting}
              className="flex-1 rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "กำลังดำเนินการ..." : "ยืนยันการปฏิเสธ"}
            </button>
            <button
              type="button"
              onClick={() => setShowRejectNote(false)}
              disabled={submitting}
              className="flex-1 rounded-full border border-shop-blush-200 px-6 py-2.5 text-sm font-semibold text-shop-text hover:bg-shop-blush-50"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
