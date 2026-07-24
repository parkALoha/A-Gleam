"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/admin/useConfirm";

export default function OrderActions({
  orderNumber,
  status,
}: {
  orderNumber: string;
  status: string;
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectNote, setShowRejectNote] = useState(false);
  const [note, setNote] = useState("");

  async function post(path: string, body?: object) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? `เกิดข้อผิดพลาด (${res.status})`);
        return false;
      }
      return true;
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirm() {
    if (!(await confirm("ยืนยันคำสั่งซื้อนี้? สต็อกสินค้าจะถูกตัดทันที"))) return;
    if (await post("confirm")) router.refresh();
  }

  async function handleReject() {
    if (await post("reject", { note })) router.refresh();
  }

  async function handlePrintLabel() {
    if (await post("print-label")) router.push(`/admin/orders/${orderNumber}/label`);
  }

  async function handleDeliver() {
    if (!(await confirm("ยืนยันว่าลูกค้าได้รับสินค้าแล้ว?"))) return;
    if (await post("deliver")) router.refresh();
  }

  async function handleReturn() {
    if (!(await confirm("ยืนยันว่าพัสดุนี้ถูกตีกลับ?"))) return;
    if (await post("return")) router.refresh();
  }

  if (status === "pending_verification") {
    return (
      <div className="mt-4 space-y-3">
        {dialog}
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

  if (status === "confirmed") {
    return (
      <div className="mt-4 space-y-2">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="button"
          onClick={handlePrintLabel}
          disabled={submitting}
          className="w-full rounded-full bg-shop-blush-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "กำลังสร้าง label..." : "พิมพ์ใบ Label"}
        </button>
        <p className="text-xs text-shop-text-soft">
          จะสร้างเลขพัสดุ (mock) และเปลี่ยนสถานะเป็น &quot;จัดส่งแล้ว&quot; ให้อัตโนมัติ
        </p>
      </div>
    );
  }

  if (status === "shipped") {
    return (
      <div className="mt-4 space-y-3">
        {dialog}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDeliver}
            disabled={submitting}
            className="flex-1 rounded-full bg-shop-blush-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "กำลังดำเนินการ..." : "ทำเครื่องหมายว่าจัดส่งสำเร็จ"}
          </button>
          <button
            type="button"
            onClick={handleReturn}
            disabled={submitting}
            className="flex-1 rounded-full border border-red-200 px-6 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            ตีกลับ
          </button>
        </div>
      </div>
    );
  }

  return null;
}
