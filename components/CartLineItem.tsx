"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, type CartItem } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";

type VariantOption = {
  id: string;
  colorName: string;
  image: string | null;
  quantityAvailable: number;
  inStock: boolean;
};

export default function CartLineItem({ item }: { item: CartItem }) {
  const { removeItem, updateQuantity, changeVariant } = useCart();
  const [variants, setVariants] = useState<VariantOption[]>([]);

  useEffect(() => {
    fetch(`/api/products/${item.slug}/variants`)
      .then((res) => (res.ok ? res.json() : { variants: [] }))
      .then((data) => setVariants(data.variants ?? []))
      .catch(() => setVariants([]));
  }, [item.slug]);

  function handleColorChange(newVariantId: string) {
    const next = variants.find((v) => v.id === newVariantId);
    if (!next) return;
    changeVariant(item.lineId, {
      variantId: next.id,
      colorName: next.colorName,
      image: next.image ?? item.image,
      maxQuantity: next.quantityAvailable,
    });
  }

  return (
    <div className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-shop-blush-100">
      <Link
        href={`/products/${item.slug}`}
        className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-shop-blush-50"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          unoptimized
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

        {variants.length > 1 && (
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
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 rounded-full bg-shop-blush-50 px-2 py-1">
            <button
              onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-shop-text shadow-sm hover:bg-shop-blush-100"
              aria-label="ลดจำนวน"
            >
              −
            </button>
            <span className="w-4 text-center text-sm text-shop-text">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-shop-text shadow-sm hover:bg-shop-blush-100 disabled:opacity-40"
              aria-label="เพิ่มจำนวน"
            >
              +
            </button>
          </div>
          <span className="text-sm font-medium text-shop-text">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
