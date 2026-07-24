import Link from "next/link";
import Image from "next/image";
import { getAdminSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { formatPrice } from "@/lib/format";
import PublishToggle from "@/components/admin/PublishToggle";

export default async function AdminProductsPage() {
  await getAdminSession();

  const supabase = createServiceClient();
  const { data: products } = await supabase
    .from("products")
    .select(
      "id, slug, name, price, compare_at_price, tag, cover_image, is_published, product_variants(images, stock_quantity)",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-shop-text">จัดการสินค้า</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-shop-blush-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          + เพิ่มสินค้าใหม่
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <p className="mt-10 text-center text-shop-text-soft">ยังไม่มีสินค้า</p>
      ) : (
        <div className="mt-6 space-y-3">
          {products.map((product) => {
            const thumbnail = product.cover_image ?? product.product_variants[0]?.images[0];
            const totalStock = product.product_variants.reduce(
              (sum, v) => sum + v.stock_quantity,
              0,
            );

            return (
              <Link
                key={product.id}
                href={`/admin/products/${product.slug}/edit`}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-shop-blush-100 transition-colors hover:bg-shop-blush-50/50"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-shop-beige-100">
                  {thumbnail && (
                    <Image
                      src={thumbnail}
                      alt=""
                      width={64}
                      height={64}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-shop-text">{product.name}</p>
                  <p className="text-sm text-shop-text-soft">
                    {formatPrice(product.price)}
                    {product.compare_at_price ? (
                      <span className="ml-1 line-through">
                        {formatPrice(product.compare_at_price)}
                      </span>
                    ) : null}
                    {product.tag ? ` · ${product.tag}` : ""}
                  </p>
                  <p className="text-xs text-shop-text-soft">
                    {product.product_variants.length} สี · สต็อกรวม {totalStock}
                  </p>
                </div>

                <PublishToggle productId={product.id} isPublished={product.is_published} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
