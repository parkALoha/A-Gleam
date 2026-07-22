import { getPublishedProducts } from "@/lib/products";
import { getShopSettings } from "@/lib/shop-settings";
import { getVisibleReviews } from "@/lib/reviews";
import ProductCard from "@/components/ProductCard";
import HeroBanner from "@/components/HeroBanner";
import ReviewGallery from "@/components/ReviewGallery";

export default async function Home() {
  const [products, settings] = await Promise.all([
    getPublishedProducts(),
    getShopSettings(),
  ]);
  const reviews = settings.reviewsSectionEnabled
    ? await getVisibleReviews()
    : [];

  return (
    <>
      <HeroBanner images={settings.heroImageUrls} headline={settings.heroHeadline} />

      <section id="products" className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-2xl font-semibold text-shop-text">
          สินค้าทั้งหมด
        </h2>
        <p className="mt-1 text-sm text-shop-text-soft">
          {products.length} รายการ
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {settings.reviewsSectionEnabled && reviews.length > 0 && (
        <ReviewGallery reviews={reviews} />
      )}
    </>
  );
}
