import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await getAdminSession();
  const { slug } = await params;

  const supabase = createServiceClient();
  const { data: product } = await supabase
    .from("products")
    .select(
      "id, slug, name, price, compare_at_price, tag, description, measurements, video_url, cover_image, is_published, product_variants(id, color_name, images, stock_quantity, sort_order)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  const initialValues: ProductFormValues = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: Number(product.price),
    compareAtPrice: product.compare_at_price != null ? Number(product.compare_at_price) : null,
    tag: product.tag ?? "",
    description: product.description ?? "",
    bust: product.measurements?.bust ?? 0,
    length: product.measurements?.length ?? 0,
    shoulder: product.measurements?.shoulder ?? 0,
    videoUrl: product.video_url ?? "",
    coverImage: product.cover_image,
    isPublished: product.is_published,
    variants: [...product.product_variants]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((v) => ({
        id: v.id,
        colorName: v.color_name,
        images: v.images,
        stockQuantity: v.stock_quantity,
      })),
  };

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <Link href="/admin/products" className="text-sm text-shop-text-soft hover:text-shop-blush-600">
        ← กลับไปหน้ารายการสินค้า
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-shop-text">แก้ไขสินค้า</h1>

      <div className="mt-6">
        <ProductForm initialValues={initialValues} />
      </div>
    </div>
  );
}
