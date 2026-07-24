"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <h1 className="text-xl font-semibold text-shop-text">เกิดข้อผิดพลาด</h1>
      <p className="mt-2 text-sm text-shop-text-soft">
        ไม่สามารถโหลดหน้านี้ได้ กรุณาลองใหม่อีกครั้ง
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-shop-blush-500 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105"
        >
          ลองใหม่
        </button>
        <Link
          href="/admin"
          className="rounded-full border border-shop-blush-200 px-8 py-2.5 text-sm font-medium text-shop-text hover:bg-shop-blush-50"
        >
          กลับหน้าแดชบอร์ด
        </Link>
      </div>
    </div>
  );
}
