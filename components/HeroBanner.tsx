"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroSlide } from "@/lib/shop-settings";

const HERO_HEIGHT_CLASSES =
  "relative h-[46vh] min-h-[300px] max-h-[520px] w-full sm:h-[52vh] sm:max-h-[600px]";

const SLIDE_INTERVAL_MS = 4500;

const POSITION_CLASSES: Record<HeroSlide["position"], string> = {
  top: "justify-start pt-10 sm:pt-14",
  center: "justify-center",
  bottom: "justify-end pb-14 sm:pb-20",
};

const OVERLAY_CLASSES: Record<HeroSlide["overlay"], string> = {
  light: "from-black/30 via-transparent to-transparent",
  medium: "from-black/55 via-transparent to-transparent",
  dark: "from-black/75 via-black/10 to-transparent",
};

export default function HeroBanner({ slides }: { slides: HeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = slides[activeIndex];
  const title = active?.headline || "แต่งตัวให้น่ารักทุกวัน";

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
          className={`absolute inset-0 flex flex-col items-center px-5 text-center text-white ${
            POSITION_CLASSES[active?.position ?? "bottom"]
          }`}
        >
          <p className="text-xs font-medium tracking-wide sm:text-sm">
            Casual &amp; Cuteness Everyday ☁️
          </p>
          <h1 className="mt-2 text-3xl font-semibold drop-shadow-sm sm:text-5xl">
            {title}
          </h1>
          <a
            href={active?.linkUrl || "#products"}
            className="mt-5 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-shop-blush-600 shadow-sm transition-transform hover:scale-105"
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
