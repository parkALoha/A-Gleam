"use client";

import { useEffect, useState } from "react";

type Status = "checking" | "unsupported" | "enabled" | "disabled" | "denied";

// Web Push wants the VAPID public key as a raw Uint8Array, not the
// URL-safe base64 string it's normally shared as.
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function PushNotificationToggle() {
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.getSubscription();
      setStatus(subscription ? "enabled" : "disabled");
    }

    checkStatus();
  }, []);

  async function handleEnable() {
    setError(null);
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        setError("ระบบแจ้งเตือนยังไม่ได้ตั้งค่า (ไม่มี VAPID key)");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const res = await fetch("/api/admin/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) {
        setError("บันทึกการแจ้งเตือนไม่สำเร็จ ลองใหม่อีกครั้ง");
        return;
      }

      setStatus("enabled");
    } catch {
      setError("เปิดการแจ้งเตือนไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setError(null);
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/admin/push-subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setStatus("disabled");
    } catch {
      setError("ปิดการแจ้งเตือนไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
      <p className="font-medium text-shop-text">การแจ้งเตือนออเดอร์ใหม่</p>
      <p className="mt-1 text-xs text-shop-text-soft">
        เปิดไว้เพื่อรับแจ้งเตือนทันทีที่มีลูกค้าสั่งซื้อ — บนไอโฟนต้อง
        &ldquo;เพิ่มลงหน้าจอโฮม&rdquo; ก่อนถึงจะเปิดได้
      </p>

      <div className="mt-3">
        {status === "checking" && (
          <p className="text-sm text-shop-text-soft">กำลังตรวจสอบ...</p>
        )}
        {status === "unsupported" && (
          <p className="text-sm text-shop-text-soft">
            เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน
          </p>
        )}
        {status === "denied" && (
          <p className="text-sm text-red-500">
            ถูกปิดกั้นสิทธิ์การแจ้งเตือนไว้ — ไปเปิดในตั้งค่าเบราว์เซอร์ก่อน
          </p>
        )}
        {status === "disabled" && (
          <button
            type="button"
            onClick={handleEnable}
            disabled={busy}
            className="rounded-full bg-shop-blush-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "กำลังเปิด..." : "เปิดการแจ้งเตือน"}
          </button>
        )}
        {status === "enabled" && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-green-600">
              เปิดการแจ้งเตือนอยู่ ✓
            </span>
            <button
              type="button"
              onClick={handleDisable}
              disabled={busy}
              className="text-sm text-shop-text-soft underline hover:text-shop-blush-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "กำลังปิด..." : "ปิดการแจ้งเตือน"}
            </button>
          </div>
        )}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
