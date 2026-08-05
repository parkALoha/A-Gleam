"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/useToast";

export default function MaintenanceToggle({ enabled: enabledProp }: { enabled: boolean }) {
  const router = useRouter();
  const { showToast, toast } = useToast();
  const [enabled, setEnabled] = useState(enabledProp);
  const [submitting, setSubmitting] = useState(false);

  async function handleToggle() {
    const next = !enabled;
    setEnabled(next); // flip immediately — waiting on the round trip made the
    // switch feel broken, like it wasn't registering the tap at all.
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      if (!res.ok) {
        setEnabled(!next);
        showToast("เปลี่ยนสถานะไม่สำเร็จ ลองใหม่อีกครั้ง");
        return;
      }
      router.refresh();
    } catch {
      setEnabled(!next);
      showToast("เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`rounded-2xl p-5 shadow-sm ring-1 ${
        enabled ? "bg-amber-50 ring-amber-200" : "bg-white ring-shop-blush-100"
      }`}
    >
      {toast}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-shop-text">ปิดเว็บชั่วคราว (ปรับปรุง)</p>
          <p className="mt-1 text-xs text-shop-text-soft">
            ลูกค้าจะเห็นหน้า &quot;กำลังปรับปรุง&quot; แทนหน้าร้านทั้งหมด —
            แอดมินที่ล็อกอินอยู่ยังเข้าดูหน้าเว็บจริงได้ตามปกติ
            เพื่อตรวจสอบก่อนเปิดใช้งาน
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={submitting}
          aria-pressed={enabled}
          aria-label="ปิดเว็บชั่วคราว"
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            enabled ? "bg-amber-500" : "bg-shop-beige-200"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
