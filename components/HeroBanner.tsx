"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroSlide } from "@/lib/shop-settings";

const HERO_HEIGHT_CLASSES =
  "relative h-[46vh] min-h-[300px] max-h-[520px] w-full sm:h-[52vh] sm:max-h-[600px]";

const SLIDE_INTERVAL_MS = 4500;

const OVERLAY_CLASSES: Record<HeroSlide["overlay"], string> = {
  light: "from-black/30 via-transparent to-transparent",
  medium: "from-black/55 via-transparent to-transparent",
  dark: "from-black/75 via-black/10 to-transparent",
};

// Anchors the text block to the nearest edge of its (x, y) point instead of
// always centering on it — a tall block centered on a point near the bottom
// (e.g. y=82) would extend past the image edge and get clipped by the
// section's overflow-hidden. Anchoring to the nearest third makes it grow
// inward from whichever edge it's closest to instead.
function edgeTranslate(percent: number, nearStart: string, middle: string, nearEnd: string) {
  if (percent < 33) return nearStart;
  if (percent > 66) return nearEnd;
  return middle;
}

export default function HeroBanner({ slides }: { slides: HeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = slides[activeIndex];
  const title = active?.headline || "แต่งตัวให้น่ารักทุกวัน";
  const positionX = active?.positionX ?? 50;
  const positionY = active?.positionY ?? 82;
  const translateX = edgeTranslate(positionX, "0%", "-50%", "-100%");
  const translateY = edgeTranslate(positionY, "0%", "-50%", "-100%");

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className="relative isolate overflow-hidden bg-shop-text">
      <div className={HERO_HEIGHT_CLASSES}>
        {slides.length > 0 ? (
          slides.map((slide, index) => (
            <div
              key={slide.imageUrl}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === activeIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Blurred fill so the wide banner is never empty */}
              <Image
                src={slide.imageUrl}
                alt=""
                aria-hidden
                fill
                sizes="100vw"
                className="scale-110 object-cover opacity-60 blur-2xl"
              />
              {/* Full photo, never cropped — photos are portrait (iPhone),
                  so this always shows the whole shot, heads included */}
              <Image
                src={slide.imageUrl}
                alt={slide.headline || title}
                fill
                sizes="100vw"
                priority={index === 0}
                className="object-contain"
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-shop-blush-100 via-shop-blush-50 to-shop-cream" />
        )}

        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            OVERLAY_CLASSES[active?.overlay ?? "medium"]
          }`}
        />

        <div
          className="absolute flex w-[85%] max-w-sm flex-col items-center px-5 text-center text-white"
          style={{
            left: `${positionX}%`,
            top: `${positionY}%`,
            transform: `translate(${translateX}, ${translateY})`,
          }}
        >
          <p className="text-xs font-medium tracking-wide sm:text-sm">
            Casual &amp; Cuteness Everyday ☁️
          </p>
          <h1 className="mt-3 text-3xl leading-snug font-semibold drop-shadow-sm sm:text-5xl sm:leading-snug">
            {title}
          </h1>
          <a
            href={active?.linkUrl || "#products"}
            className="mt-6 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-shop-blush-600 shadow-sm transition-transform hover:scale-105"
          >
            ช้อปเลย
          </a>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, index) => (
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
