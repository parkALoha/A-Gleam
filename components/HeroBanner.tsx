"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const HERO_HEIGHT_CLASSES =
  "relative h-[46vh] min-h-[300px] max-h-[520px] w-full sm:h-[52vh] sm:max-h-[600px]";

const SLIDE_INTERVAL_MS = 4500;

export default function HeroBanner({
  images,
  headline,
}: {
  images: string[];
  headline: string | null;
}) {
  const title = headline || "แต่งตัวให้น่ารักทุกวัน";
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <section className="relative isolate overflow-hidden bg-shop-text">
      <div className={HERO_HEIGHT_CLASSES}>
        {images.length > 0 ? (
          images.map((src, index) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === activeIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Blurred fill so the wide banner is never empty */}
              <Image
                src={src}
                alt=""
                aria-hidden
                fill
                unoptimized
                className="scale-110 object-cover opacity-60 blur-2xl"
              />
              {/* Full photo, never cropped — photos are portrait (iPhone),
                  so this always shows the whole shot, heads included */}
              <Image
                src={src}
                alt={title}
                fill
                unoptimized
                priority={index === 0}
                className="object-contain"
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-shop-blush-100 via-shop-blush-50 to-shop-cream" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-end px-5 pb-14 text-center text-white sm:pb-20">
          <p className="text-xs font-medium tracking-wide sm:text-sm">
            Casual &amp; Cuteness Everyday ☁️
          </p>
          <h1 className="mt-2 text-3xl font-semibold drop-shadow-sm sm:text-5xl">
            {title}
          </h1>
          <a
            href="#products"
            className="mt-5 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-shop-blush-600 shadow-sm transition-transform hover:scale-105"
          >
            ช้อปเลย
          </a>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`สไลด์ที่ ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
