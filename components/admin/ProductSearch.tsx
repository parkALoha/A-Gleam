"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const trimmed = value.trim();
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (trimmed) params.set("q", trimmed);
      router.push(`/admin/products${params.toString() ? `?${params.toString()}` : ""}`);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the input value changes, not on every router identity change
  }, [value]);

  return (
    <div className="mt-4 flex items-center gap-2 rounded-full border border-shop-blush-200 bg-white px-4 py-2.5">
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0 text-shop-text-soft"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35M18 10.5a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ค้นหาชื่อสินค้า..."
        className="w-full bg-transparent text-sm text-shop-text outline-none placeholder:text-shop-text-soft"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="ล้างคำค้นหา"
          className="shrink-0 text-shop-text-soft hover:text-shop-blush-600"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
