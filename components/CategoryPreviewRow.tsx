import type { Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function CategoryPreviewRow({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <h2 className="text-2xl font-semibold text-shop-text">{title}</h2>

      {/* Mobile: horizontal swipe, ~2 cards visible + a peek of the next one */}
      <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:hidden">
        {products.map((product) => (
          <div key={product.id} className="w-[44%] shrink-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Tablet/desktop: static grid, no scrolling */}
      <div className="mt-5 hidden gap-6 sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
