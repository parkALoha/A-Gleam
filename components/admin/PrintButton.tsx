"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-shop-blush-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
    >
      พิมพ์
    </button>
  );
}
