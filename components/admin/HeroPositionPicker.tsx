"use client";

import { useRef } from "react";

const PRESETS = [10, 50, 90];

export default function HeroPositionPicker({
  imageUrl,
  positionX,
  positionY,
  onChange,
}: {
  imageUrl: string;
  positionX: number;
  positionY: number;
  onChange: (positionX: number, positionY: number) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  function setFromPointer(clientX: number, clientY: number) {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    onChange(Math.round(x), Math.round(y));
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromPointer(e.clientX, e.clientY);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons !== 1) return;
    setFromPointer(e.clientX, e.clientY);
  }

  return (
    <div>
      <div
        ref={boxRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="relative aspect-video w-full touch-none overflow-hidden rounded-lg bg-shop-beige-100 bg-cover bg-center ring-1 ring-shop-blush-100 select-none"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      >
        {PRESETS.map((py) =>
          PRESETS.map((px) => (
            <button
              key={`${px}-${py}`}
              type="button"
              onClick={() => onChange(px, py)}
              aria-label={`ตำแหน่งสำเร็จรูป ${px}%, ${py}%`}
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-black/10 transition-colors hover:bg-white/50"
              style={{ left: `${px}%`, top: `${py}%` }}
            />
          )),
        )}

        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-shop-blush-500 bg-white shadow"
          style={{ left: `${positionX}%`, top: `${positionY}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-shop-text-soft">
        แตะหรือลากในกรอบเพื่อวางตำแหน่งข้อความเอง หรือกดจุดใดจุดหนึ่งเพื่อเลือกตำแหน่งสำเร็จรูป
      </p>
    </div>
  );
}
