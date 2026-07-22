"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Product, ProductVariant } from "@/lib/products";

export default function AddToCartButton({
  product,
  variant,
}: {
  product: Product;
  variant: ProductVariant | null;
}) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    if (!variant) return;
    addItem(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        colorName: variant.colorName,
        price: product.price,
        image: variant.images[0] ?? product.images[0],
        maxQuantity: variant.quantityAvailable,
      },
      1,
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  if (!variant) {
    return (
      <button
        disabled
        className="mt-8 w-full rounded-full bg-shop-blush-500/40 px-8 py-3.5 text-sm font-semibold text-white cursor-not-allowed"
      >
        กรุณาเลือกสีก่อน
      </button>
    );
  }

  if (!variant.inStock) {
    return (
      <button
        disabled
        className="mt-8 w-full rounded-full bg-shop-blush-500/40 px-8 py-3.5 text-sm font-semibold text-white cursor-not-allowed"
      >
        สีนี้หมด
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`mt-8 w-full rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ${
        justAdded
          ? "scale-[1.03] bg-shop-blush-600"
          : "bg-shop-blush-500 hover:scale-[1.02] hover:shadow-md"
      }`}
    >
      {justAdded ? "เพิ่มลงตะกร้าแล้ว ✓" : "เพิ่มลงตะกร้า"}
    </button>
  );
}
