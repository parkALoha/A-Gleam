"use client";

import { useEffect, useRef, useState } from "react";
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

// Sized off the container's own width (cqw), not the viewport (vw) — the
// admin editor renders this same component in a much narrower column than
// the full-bleed homepage, so a viewport-relative size would look right on
// the real page but wrong in the editor. Container-relative sizing stays
// accurate in both places, and still scales smoothly across every real
// screen width instead of jumping between fixed breakpoints.
//
// The admin picks the free-form cqw value (shown to them as "%"); min/max
// here are just a safety net so a typo or an extreme screen width can't
// make a line vanish or blow past the image.
const MIN_FONT_REM = 0.625;
const MAX_FONT_REM = 5;

function fontSizeFor(percent: number) {
  return `clamp(${MIN_FONT_REM}rem, ${percent}cqw, ${MAX_FONT_REM}rem)`;
}

// 3x3 quick-pick points, for when nudging a pixel at a time isn't worth it.
const POSITION_PRESETS: { label: string; x: number; y: number }[] = [
  { label: "บนซ้าย", x: 10, y: 15 },
  { label: "บนกลาง", x: 50, y: 15 },
  { label: "บนขวา", x: 90, y: 15 },
  { label: "ซ้ายกลาง", x: 10, y: 50 },
  { label: "กึ่งกลาง", x: 50, y: 50 },
  { label: "ขวากลาง", x: 90, y: 50 },
  { label: "ล่างซ้าย", x: 10, y: 85 },
  { label: "ล่างกลาง", x: 50, y: 85 },
  { label: "ล่างขวา", x: 90, y: 85 },
];

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

export default function HeroBanner({
  slides,
  editable = false,
  onPositionChange,
}: {
  slides: HeroSlide[];
  // Admin-only "edit" mode — renders this exact component as the position
  // picker instead of a separate mock preview, so there's no way for the
  // picker and the real page to ever disagree on where the text lands.
  editable?: boolean;
  onPositionChange?: (positionX: number, positionY: number) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const active = slides[activeIndex];
  const positionX = active?.positionX ?? 50;
  const positionY = active?.positionY ?? 82;
  const translateX = edgeTranslate(positionX, "0%", "-50%", "-100%");
  const translateY = edgeTranslate(positionY, "0%", "-50%", "-100%");

  useEffect(() => {
    if (editable || slides.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [slides.length, editable]);

  function setPositionFromPointer(clientX: number, clientY: number) {
    const box = boxRef.current;
    if (!box || !onPositionChange) return;
    const rect = box.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    onPositionChange(Math.round(x), Math.round(y));
  }

  return (
    <section className="relative isolate overflow-hidden bg-shop-text">
      <div
        ref={boxRef}
        className={`${HERO_HEIGHT_CLASSES} ${editable ? "cursor-crosshair select-none" : ""}`}
        style={{ containerType: "inline-size" }}
        // Deliberately not using touch-action:none / pointerdown here — on
        // mobile that made any scroll gesture that merely started over the
        // image register as "set position", hijacking the page scroll.
        // onClick only fires for a genuine tap/click with no drag in
        // between, so it can't misfire on a scroll-swipe. Continuous
        // drag-to-fine-tune is still available, but mouse-only — touch
        // dragging is exactly the gesture that conflicts with scrolling.
        onClick={
          editable
            ? (e) => setPositionFromPointer(e.clientX, e.clientY)
            : undefined
        }
        onPointerDown={
          editable
            ? (e) => {
                if (e.pointerType !== "mouse") return;
                e.currentTarget.setPointerCapture(e.pointerId);
              }
            : undefined
        }
        onPointerMove={
          editable
            ? (e) => {
                if (e.pointerType !== "mouse" || e.buttons !== 1) return;
                setPositionFromPointer(e.clientX, e.clientY);
              }
            : undefined
        }
      >
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
                alt={slide.lines.map((l) => l.text).join(" ")}
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
          {(active?.lines ?? []).map((line, i) => (
            <p
              key={i}
              className="leading-snug font-semibold tracking-wide drop-shadow-sm"
              style={{ fontSize: fontSizeFor(line.size), marginTop: i === 0 ? 0 : "0.4em" }}
            >
              {line.text}
            </p>
          ))}
          {editable ? (
            <span className="mt-6 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-shop-blush-600 shadow-sm">
              ช้อปเลย
            </span>
          ) : (
            <a
              href={active?.linkUrl || "#products"}
              className="mt-6 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-shop-blush-600 shadow-sm transition-transform hover:scale-105"
            >
              ช้อปเลย
            </a>
          )}
        </div>

        {editable &&
          POSITION_PRESETS.map(({ label, x, y }) => (
            <button
              key={label}
              type="button"
              aria-label={`ตำแหน่ง ${label}`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onPositionChange?.(x, y);
              }}
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-black/10 transition-colors hover:bg-white/60"
              style={{ left: `${x}%`, top: `${y}%` }}
            />
          ))}

        {!editable && slides.length > 1 && (
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

      {editable && (
        <p className="bg-shop-beige-50 px-3 py-1.5 text-center text-[11px] text-shop-text-soft">
          ตำแหน่ง: X {positionX}% · Y {positionY}% — แตะบนภาพเพื่อวางตำแหน่ง
          (บนคอมพิวเตอร์ลากด้วยเมาส์เพื่อปรับละเอียดได้)
        </p>
      )}
    </section>
  );
}
