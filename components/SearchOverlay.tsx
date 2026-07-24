"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchOverlay() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(`/?search=${encodeURIComponent(trimmed)}#products`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="ค้นหาสินค้า"
        className="rounded-full p-1.5 text-shop-text/70 transition-colors hover:bg-shop-blush-50 hover:text-shop-blush-600"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 sm:h-6 sm:w-6"
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
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 px-5"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-auto mt-24 max-w-lg rounded-2xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-shop-text">
                ค้นหาสินค้า
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="ปิด"
                className="text-shop-text/60 hover:text-shop-blush-600"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4">
              <div className="flex items-center gap-2 rounded-full border border-shop-blush-200 px-4 py-2.5">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-shop-text-soft"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M18 10.5a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                  />
                </svg>
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ค้นหาชื่อรุ่น"
                  className="w-full bg-transparent text-sm text-shop-text outline-none placeholder:text-shop-text-soft"
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
