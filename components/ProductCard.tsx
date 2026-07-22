import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice, formatTag } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const [variantCover, variantSecond] = product.images;
  // If a cover image (e.g. an "all colors at a glance" shot) is set, show it
  // as a static image instead of crossfading between one variant's photos —
  // crossfading into a single color would misrepresent the "all colors" cover.
  const cover = product.coverImage ?? variantCover;
  const second = product.coverImage ? undefined : variantSecond;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group block overflow-hidden rounded-3xl bg-white shadow-sm transition-shadow hover:shadow-md ${
        product.tag
          ? "ring-2 ring-shop-blush-400"
          : "ring-1 ring-shop-blush-100"
      }`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-shop-blush-50">
        <Image
          src={cover}
          alt={product.name}
          fill
          unoptimized
          className={`object-cover transition-opacity duration-300 ${second ? "group-hover:opacity-0" : ""}`}
        />
        {second && (
          <Image
            src={second}
            alt={product.name}
            fill
            unoptimized
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
        {product.tag && (
          <span className="absolute left-3 top-3 animate-[pop-in_0.4s_ease-out] rounded-full bg-shop-blush-500 px-3 py-1 text-xs font-semibold tracking-wide text-white shadow-sm">
            {formatTag(product.tag)}
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="rounded-full bg-shop-text px-4 py-1 text-xs font-semibold text-white">
              สินค้าหมด
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-shop-text line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="font-semibold text-shop-blush-600">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-shop-text-soft line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
