"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-shop-cream px-5 text-center">
      <p className="text-sm font-medium tracking-wide text-shop-blush-500">A GLEAM</p>
      <h1 className="mt-2 text-2xl font-semibold text-shop-text">เกิดข้อผิดพลาด</h1>
      <p className="mt-2 text-sm text-shop-text-soft">
        ขออภัย มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-shop-blush-500 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105"
        >
          ลองใหม่
        </button>
        <Link
          href="/"
          className="rounded-full border border-shop-blush-200 px-8 py-2.5 text-sm font-medium text-shop-text hover:bg-shop-blush-50"
        >
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}
