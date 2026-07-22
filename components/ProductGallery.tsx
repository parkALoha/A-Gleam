"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const THUMBS_PER_PAGE = 3;

export default function ProductGallery({
  images,
  videoUrl,
  alt,
}: {
  images: string[];
  videoUrl?: string;
  alt: string;
}) {
  const media = videoUrl ? [...images, videoUrl] : images;
  const [activeIndex, setActiveIndex] = useState(0);
  const active = media[activeIndex];
  const isVideo = videoUrl !== undefined && activeIndex === media.length - 1;
  const touchStartX = useRef<number | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Crossfade: keep the last fully-shown image visible underneath while the
  // next one fades in, so switching photos never flashes the empty background.
  const [prevActive, setPrevActive] = useState(active);
  const [shownSrc, setShownSrc] = useState(active);
  const [incomingSrc, setIncomingSrc] = useState<string | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  if (active !== prevActive) {
    setPrevActive(active);
    if (isVideo) {
      setShownSrc(active);
      setIncomingSrc(null);
    } else {
      setIncomingSrc(active);
      setFadeIn(false);
    }
  }

  useEffect(() => {
    if (!incomingSrc) return;
    const raf = requestAnimationFrame(() => setFadeIn(true));
    return () => cancelAnimationFrame(raf);
  }, [incomingSrc]);

  function handleFadeEnd() {
    if (!incomingSrc) return;
    setShownSrc(incomingSrc);
    setIncomingSrc(null);
  }

  const pageStart =
    Math.floor(activeIndex / THUMBS_PER_PAGE) * THUMBS_PER_PAGE;
  const visibleThumbs = media.slice(pageStart, pageStart + THUMBS_PER_PAGE);
  const remainingCount = media.length - (pageStart + THUMBS_PER_PAGE);

  function goNext() {
    setActiveIndex((i) => (i + 1) % media.length);
  }

  function goPrev() {
    setActiveIndex((i) => (i - 1 + media.length) % media.length);
  }

  function selectThumb(index: number) {
    setActiveIndex(index);
    mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goToNextThumbPage() {
    setActiveIndex(Math.min(pageStart + THUMBS_PER_PAGE, media.length - 1));
    mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    touchStartX.current = null;
  }

  return (
    <div>
      <div
        ref={mainRef}
        className="group relative aspect-[3/4] scroll-mt-28 touch-pan-y select-none overflow-hidden rounded-3xl bg-shop-blush-50"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isVideo ? (
          <video
            src={active}
            controls
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            <Image
              src={shownSrc}
              alt={alt}
              fill
              unoptimized
              className="object-cover"
              priority
            />
            {incomingSrc && (
              <Image
                src={incomingSrc}
                alt={alt}
                fill
                unoptimized
                onLoad={() => setFadeIn(true)}
                onTransitionEnd={handleFadeEnd}
                className={`object-cover transition-opacity duration-200 ${
                  fadeIn ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
          </>
        )}

        {media.length > 1 && (
          <>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {media.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>

            <div className="absolute bottom-3 right-3 hidden gap-2 lg:flex">
              <button
                type="button"
                onClick={goPrev}
                aria-label="รูปก่อนหน้า"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-shop-text shadow-sm transition-colors hover:bg-white"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="รูปถัดไป"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-shop-text shadow-sm transition-colors hover:bg-white"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
      {media.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {visibleThumbs.map((src, i) => {
            const index = pageStart + i;
            const isThisVideo = videoUrl !== undefined && index === media.length - 1;
            const isLastVisible = i === visibleThumbs.length - 1;
            const showMoreBadge = isLastVisible && remainingCount > 0;

            return (
              <button
                key={src}
                type="button"
                onClick={showMoreBadge ? goToNextThumbPage : () => selectThumb(index)}
                aria-label={showMoreBadge ? `ดูอีก ${remainingCount} รูป` : undefined}
                className={`relative aspect-[3/4] overflow-hidden rounded-xl ring-2 transition-all ${
                  index === activeIndex
                    ? "ring-shop-blush-500"
                    : "ring-transparent hover:ring-shop-blush-300"
                }`}
              >
                {isThisVideo ? (
                  <video src={src} muted className="h-full w-full object-cover" />
                ) : (
                  <Image
                    src={src}
                    alt={`${alt} ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                )}
                {isThisVideo && !showMoreBadge && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                    ▶
                  </span>
                )}
                {showMoreBadge && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                    +{remainingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
