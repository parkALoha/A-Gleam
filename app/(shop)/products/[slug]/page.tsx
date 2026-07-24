import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/products";
import ProductPageContent from "@/components/ProductPageContent";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link
        href="/"
        className="text-sm text-shop-text-soft hover:text-shop-blush-600"
      >
        ← กลับหน้าแรก
      </Link>

      <ProductPageContent product={product} />
    </div>
  );
}
