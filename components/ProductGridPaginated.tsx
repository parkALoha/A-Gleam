"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

const PAGE_SIZE = 8;

export default function ProductGridPaginated({
  initialProducts,
  total,
  tag,
  search,
}: {
  initialProducts: Product[];
  total: number;
  tag?: string;
  search?: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const hasMore = products.length < total;
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Refs (not state) so the observer callback always sees the latest values
  // synchronously — state alone isn't enough to stop an IntersectionObserver
  // from firing loadMore() twice back-to-back before a render commits,
  // which previously appended the same page of products and broke React keys.
  const productsRef = useRef(products);
  const hasMoreRef = useRef(hasMore);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    productsRef.current = products;
    hasMoreRef.current = hasMore;
  }, [products, hasMore]);

  async function loadMore() {
    if (isFetchingRef.current || !hasMoreRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(productsRef.current.length),
      });
      if (tag) params.set("tag", tag);
      if (search) params.set("search", search);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts((current) => {
        const existingIds = new Set(current.map((p) => p.id));
        const fresh = (data.products ?? []).filter(
          (p: Product) => !existingIds.has(p.id),
        );
        return [...current, ...fresh];
      });
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="mt-8 text-center text-sm text-shop-text-soft">
          {loading ? "กำลังโหลด..." : ""}
        </div>
      )}
    </>
  );
}
