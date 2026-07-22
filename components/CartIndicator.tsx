"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartIndicator() {
  const { totalItems, hydrated } = useCart();

  return (
    <Link
      href="/cart"
      aria-label="ตะกร้าสินค้า"
      className="relative inline-flex items-center justify-center text-shop-text transition-colors hover:text-shop-blush-600"
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
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
        />
      </svg>
      {hydrated && totalItems > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 animate-[pop-in_0.3s_ease-out] items-center justify-center rounded-full bg-shop-blush-500 text-xs font-semibold text-white">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
