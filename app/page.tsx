import {
  getPublishedProducts,
  type ProductTagFilter,
} from "@/lib/products";
import { getShopSettings } from "@/lib/shop-settings";
import { getVisibleReviews } from "@/lib/reviews";
import HeroBanner from "@/components/HeroBanner";
import ReviewGallery from "@/components/ReviewGallery";
import CategoryPreviewRow from "@/components/CategoryPreviewRow";
import ProductGridPaginated from "@/components/ProductGridPaginated";

const PAGE_SIZE = 8;
const PREVIEW_SIZE = 10;

type CategoryParam = ProductTagFilter | "all";

const VALID_CATEGORY_PARAMS: CategoryParam[] = ["new", "bestseller", "sale", "all"];

const CATEGORY_LABELS: Record<CategoryParam, string> = {
  new: "สินค้าใหม่",
  bestseller: "สินค้าขายดี",
  sale: "สินค้าลดราคา (SALE)",
  all: "สินค้าทั้งหมด",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; search?: string }>;
}) {
  const { tag: tagParam, search } = await searchParams;
  const category = VALID_CATEGORY_PARAMS.includes(tagParam as CategoryParam)
    ? (tagParam as CategoryParam)
    : undefined;

  const settings = await getShopSettings();

  if (search) {
    const { products, total } = await getPublishedProducts({
      search,
      limit: PAGE_SIZE,
      offset: 0,
    });

    return (
      <>
        <HeroBanner images={settings.heroImageUrls} headline={settings.heroHeadline} />

        <section id="products" className="mx-auto max-w-6xl scroll-mt-32 px-5 py-14">
          <h2 className="text-2xl font-semibold text-shop-text">
            ผลการค้นหา &ldquo;{search}&rdquo;
          </h2>
          <p className="mt-1 text-sm text-shop-text-soft">{total} รายการ</p>
          {total === 0 ? (
            <p className="mt-6 text-shop-text-soft">
              ไม่พบสินค้าที่ตรงกับคำค้นหานี้ ลองใช้คำอื่นดูนะ
            </p>
          ) : (
            <ProductGridPaginated
              key={`search:${search}`}
              initialProducts={products}
              total={total}
              search={search}
            />
          )}
        </section>
      </>
    );
  }

  if (category) {
    const { products, total } = await getPublishedProducts({
      tag: category === "all" ? undefined : category,
      limit: PAGE_SIZE,
      offset: 0,
    });

    return (
      <>
        <HeroBanner images={settings.heroImageUrls} headline={settings.heroHeadline} />

        <section id="products" className="mx-auto max-w-6xl scroll-mt-32 px-5 py-14">
          <h2 className="text-2xl font-semibold text-shop-text">
            {CATEGORY_LABELS[category]}
          </h2>
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

  const [{ products: newProducts }, { products: bestSellerProducts }] =
    await Promise.all([
      getPublishedProducts({ tag: "new", limit: PREVIEW_SIZE }),
      getPublishedProducts({ tag: "bestseller", limit: PREVIEW_SIZE }),
    ]);
  const reviews = settings.reviewsSectionEnabled
    ? await getVisibleReviews()
    : [];

  return (
    <>
      <HeroBanner images={settings.heroImageUrls} headline={settings.heroHeadline} />

      <div id="products" className="scroll-mt-32">
        <CategoryPreviewRow title="สินค้าใหม่" products={newProducts} />
        <CategoryPreviewRow title="สินค้าขายดี" products={bestSellerProducts} />
      </div>

      {settings.reviewsSectionEnabled && reviews.length > 0 && (
        <ReviewGallery reviews={reviews} />
      )}
    </>
  );
}
