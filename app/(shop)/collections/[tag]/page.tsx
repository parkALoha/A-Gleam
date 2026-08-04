import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedProducts, type ProductTagFilter } from "@/lib/products";
import { getShopSettings } from "@/lib/shop-settings";
import HeroBanner from "@/components/HeroBanner";
import ProductGridPaginated from "@/components/ProductGridPaginated";

export const revalidate = 60;

const PAGE_SIZE = 8;

type CategoryParam = ProductTagFilter | "all";

const VALID_CATEGORY_PARAMS: CategoryParam[] = ["new", "bestseller", "sale", "all"];

const CATEGORY_LABELS: Record<CategoryParam, string> = {
  new: "สินค้าใหม่",
  bestseller: "สินค้าขายดี",
  sale: "สินค้าลดราคา (SALE)",
  all: "สินค้าทั้งหมด",
};

export async function generateStaticParams() {
  return VALID_CATEGORY_PARAMS.map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  if (!VALID_CATEGORY_PARAMS.includes(tag as CategoryParam)) return {};

  const label = CATEGORY_LABELS[tag as CategoryParam];
  return {
    title: label,
    description: `เลือกซื้อ${label} จาก A GLEAM เสื้อผู้หญิงไซส์เดียว น่ารักทุกวัน`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const category = tag as CategoryParam;

  if (!VALID_CATEGORY_PARAMS.includes(category)) {
    notFound();
  }

  const settings = await getShopSettings();
  const { products, total } = await getPublishedProducts({
    tag: category === "all" ? undefined : category,
    limit: PAGE_SIZE,
    offset: 0,
  });

  return (
    <>
      <HeroBanner slides={settings.heroSlides} />

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="text-2xl font-semibold text-shop-text">
          {CATEGORY_LABELS[category]}
        </h1>
        <p className="mt-1 text-sm text-shop-text-soft">{total} รายการ</p>
        <ProductGridPaginated
          key={`tag:${category}`}
          initialProducts={products}
          total={total}
          tag={category === "all" ? undefined : category}
        />
      </section>
    </>
  );
}
