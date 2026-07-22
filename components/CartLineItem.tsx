"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, type CartItem } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";

export type VariantOption = {
  id: string;
  colorName: string;
  image: string | null;
  quantityAvailable: number;
  inStock: boolean;
};

export default function CartLineItem({
  item,
  variants,
}: {
  item: CartItem;
  variants: VariantOption[];
}) {
  const { removeItem, updateQuantity, changeVariant } = useCart();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!confirmDelete) return;
    const timer = setTimeout(() => setConfirmDelete(false), 5000);
    return () => clearTimeout(timer);
  }, [confirmDelete]);

  function handleColorChange(newVariantId: string) {
    const next = variants.find((v) => v.id === newVariantId);
    if (!next) return;
    setConfirmDelete(false);
    changeVariant(item.lineId, {
      variantId: next.id,
      colorName: next.colorName,
      image: next.image ?? item.image,
      maxQuantity: next.quantityAvailable,
    });
  }

  function handleDecrease() {
    if (item.quantity === 1) {
      if (confirmDelete) {
        removeItem(item.lineId);
      } else {
        setConfirmDelete(true);
      }
      return;
    }
    updateQuantity(item.lineId, item.quantity - 1);
  }

  function handleIncrease() {
    setConfirmDelete(false);
    updateQuantity(item.lineId, item.quantity + 1);
  }

  const isDeleteStep = item.quantity === 1 && confirmDelete;
  const hasColorPicker = variants.length > 1;

  return (
    <div className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-shop-blush-100">
      <Link
        href={`/products/${item.slug}`}
        className="relative w-20 shrink-0 self-stretch overflow-hidden rounded-xl bg-shop-blush-50"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          unoptimized
          loading="eager"
          className="object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/products/${item.slug}`}
              className="font-medium text-shop-text hover:text-shop-blush-600"
            >
              {item.name}
            </Link>
            <p className="text-sm text-shop-text-soft">
              {formatPrice(item.price)}
            </p>
          </div>
          <button
            onClick={() => removeItem(item.lineId)}
            className="text-sm text-shop-text-soft hover:text-shop-blush-600"
            aria-label="ลบสินค้า"
          >
            ลบ
          </button>
        </div>

        <div className="flex flex-1 items-end justify-between gap-2">
          {hasColorPicker ? (
            <div className="flex items-center gap-2">
              <label className="text-xs text-shop-text-soft">สี</label>
              <select
                value={item.variantId}
                onChange={(e) => handleColorChange(e.target.value)}
                className="rounded-lg border border-shop-blush-100 bg-white px-2 py-1 text-sm text-shop-text outline-none focus:border-shop-blush-500"
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={!v.inStock}>
                    {v.colorName}
                    {!v.inStock ? " (หมด)" : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3 rounded-full bg-shop-blush-50 px-2 py-1">
            <button
              onClick={handleDecrease}
              className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-sm shadow-sm transition-colors ${
                isDeleteStep
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white text-shop-text hover:bg-shop-blush-100"
              }`}
              aria-label={isDeleteStep ? "ลบสินค้า" : "ลดจำนวน"}
            >
              {isDeleteStep ? "ลบ" : "−"}
            </button>
            <span className="w-4 text-center text-sm text-shop-text">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={item.quantity >= item.maxQuantity}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-shop-text shadow-sm hover:bg-shop-blush-100 disabled:opacity-40"
              aria-label="เพิ่มจำนวน"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
