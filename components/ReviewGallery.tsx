import Image from "next/image";
import type { Review } from "@/lib/reviews";

export default function ReviewGallery({ reviews }: { reviews: Review[] }) {
  return (
    <section className="bg-shop-beige-100 py-14">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-center text-sm font-medium tracking-wide text-shop-blush-600">
          POLAROID REVIEW GALLERY
        </p>
        <h2 className="mt-1 text-center text-2xl font-semibold text-shop-text">
          รีวิวจากลูกค้า A GLEAM
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="rotate-[var(--tilt)] bg-white p-2 pb-4 shadow-md transition-transform hover:rotate-0 hover:scale-105"
              style={
                {
                  "--tilt": `${index % 2 === 0 ? -3 : 3}deg`,
                } as React.CSSProperties
              }
            >
              <div className="relative aspect-square w-full overflow-hidden bg-shop-blush-50">
                <Image
                  src={review.imageUrl}
                  alt={review.customerHandle}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              {review.caption && (
                <p className="mt-2 text-center text-xs italic text-shop-text">
                  {review.caption}
                </p>
              )}
              <p className="mt-1 text-center text-[10px] text-shop-text-soft">
                {"★".repeat(review.rating)} — {review.customerHandle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
