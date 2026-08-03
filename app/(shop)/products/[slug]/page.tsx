import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getPublishedProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import ProductPageContent from "@/components/ProductPageContent";

// Statically prerender every published product page (fast, CDN-served)
// instead of hitting Supabase on every single visit, and re-check for
// changes at most once a minute so a price/stock/publish edit in admin
// still shows up quickly.
export const revalidate = 60;

export async function generateStaticParams() {
  const { products } = await getPublishedProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "ไม่พบสินค้า" };
  }

  const title = `${product.name} — ${formatPrice(product.price)}`;
  const description = product.description || `${product.name} จาก A GLEAM`;
  const image = product.coverImage ?? product.images[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

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
