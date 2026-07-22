"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import CartLineItem from "@/components/CartLineItem";

export default function CartPage() {
  const { items, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <p className="text-4xl">🛍️</p>
        <h1 className="mt-4 text-2xl font-semibold text-shop-text">
          ตะกร้ายังว่างอยู่
        </h1>
        <p className="mt-2 text-shop-text-soft">
          ไปเลือกเสื้อน่ารักๆ กันเถอะ
        </p>
        <Link
          href="/#products"
          className="mt-6 inline-block rounded-full bg-shop-blush-500 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105"
        >
          ดูสินค้าทั้งหมด
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-2xl font-semibold text-shop-text">ตะกร้าสินค้า</h1>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <CartLineItem key={item.lineId} item={item} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between rounded-2xl bg-shop-beige-100 p-5">
        <span className="font-medium text-shop-text">ยอดรวม</span>
        <span className="text-xl font-semibold text-shop-blush-600">
          {formatPrice(totalPrice)}
        </span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block w-full rounded-full bg-shop-blush-500 px-8 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
      >
        ไปหน้าชำระเงิน
      </Link>
    </div>
  );
}
