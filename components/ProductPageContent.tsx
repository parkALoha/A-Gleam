"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/products";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";

export default function ProductPageContent({ product }: { product: Product }) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  // Single-color products have nothing to pick — just use it directly.
  const selectedVariant =
    product.variants.length === 1
      ? product.variants[0]
      : (product.variants.find((v) => v.id === selectedVariantId) ?? null);

  const allImages = [
    ...(product.coverImage ? [product.coverImage] : []),
    ...product.variants.flatMap((v) => v.images),
  ];
  const galleryImages = selectedVariant ? selectedVariant.images : allImages;

  const measurementRows: [string, number][] = [
    ["รอบอก", product.measurements.bust],
    ["ความยาว", product.measurements.length],
    ["ไหล่", product.measurements.shoulder],
  ];

  function handleSelectVariant(variantId: string) {
    setSelectedVariantId((current) => (current === variantId ? null : variantId));
  }

  return (
    <div className="mt-6 grid gap-10 sm:grid-cols-2">
      <ProductGallery
        key={selectedVariantId ?? "all"}
        images={galleryImages}
        videoUrl={selectedVariant ? product.videoUrl : undefined}
        alt={
          selectedVariant
            ? `${product.name} สี${selectedVariant.colorName}`
            : product.name
        }
      />

      <div>
        {product.tag && (
          <span className="inline-block animate-[pop-in_0.4s_ease-out] rounded-full bg-shop-blush-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {product.tag}
          </span>
        )}
        <h1 className="mt-3 text-3xl font-semibold text-shop-text">
          {product.name}
        </h1>
        <p className="mt-2 flex items-baseline gap-3">
          <span className="text-2xl font-semibold text-shop-blush-600">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-base text-shop-text-soft line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </p>

        <p className="mt-5 leading-relaxed text-shop-text-soft">
          {product.description}
        </p>

        {product.variants.length > 1 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-shop-text">
              สี:{" "}
              <span className="font-normal text-shop-text-soft">
                {selectedVariant ? selectedVariant.colorName : "เลือกสี"}
              </span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => handleSelectVariant(variant.id)}
                  disabled={!variant.inStock}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    variant.id === selectedVariantId
                      ? "border-shop-blush-500 bg-shop-blush-50 text-shop-blush-600"
                      : "border-shop-blush-100 text-shop-text hover:border-shop-blush-300"
                  } ${!variant.inStock ? "cursor-not-allowed opacity-40 line-through" : ""}`}
                >
                  {variant.colorName}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-shop-beige-100 p-4">
          <p className="text-sm font-medium text-shop-text">
            ไซส์เดียว (Free size) — ตารางขนาดตัว
          </p>
          <table className="mt-3 w-full text-sm text-shop-text-soft">
            <tbody>
              {measurementRows.map(([label, value]) => (
                <tr
                  key={label}
                  className="border-t border-shop-blush-100 first:border-t-0"
                >
                  <td className="py-1.5">{label}</td>
                  <td className="py-1.5 text-right font-medium text-shop-text">
                    {value} ซม.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-shop-text-soft">
          {selectedVariant
            ? selectedVariant.inStock
              ? `เหลือ ${selectedVariant.quantityAvailable} ชิ้น`
              : "สีนี้หมดชั่วคราว"
            : product.variants.length > 1
              ? `มีให้เลือก ${product.variants.length} สี`
              : product.inStock
                ? `เหลือ ${product.quantityAvailable} ชิ้น`
                : "สินค้าหมดชั่วคราว"}
        </p>

        <AddToCartButton product={product} variant={selectedVariant} />
      </div>
    </div>
  );
}
