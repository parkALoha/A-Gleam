"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { buildPromptPayPayload } from "@/lib/promptpay";

export default function PromptPayQr({
  promptPayId,
  amount,
}: {
  promptPayId: string;
  amount: number;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (amount <= 0) return;
    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (!cancelled) setFailed(false);
        return buildPromptPayPayload(promptPayId, amount);
      })
      .then((payload) => QRCode.toDataURL(payload, { margin: 1, width: 320 }))
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl(null);
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [promptPayId, amount]);

  if (failed) {
    return (
      <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-white p-3 text-center text-xs text-shop-text-soft">
        สร้าง QR ไม่สำเร็จ โอนตามเลขบัญชีด้านข้างได้เลย
      </div>
    );
  }

  if (amount <= 0 || !dataUrl) {
    return (
      <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-white text-xs text-shop-text-soft">
        กำลังสร้าง QR...
      </div>
    );
  }

  async function handleSave() {
    if (!dataUrl) return;

    // iOS Safari doesn't honor the <a download> attribute at all — tapping
    // it just opens the image instead of saving it. The Web Share API (with
    // an actual file attached, not just a link) opens the native share
    // sheet instead, which has "Save Image" built in and works there.
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "promptpay-qr.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
    } catch {
      // Share sheet cancelled, or share/fetch unsupported — fall through to
      // the plain download below rather than leaving the tap doing nothing.
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "promptpay-qr.png";
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- a locally-generated data: URI, not an optimizable remote image */}
      <img src={dataUrl} alt="QR พร้อมเพย์" className="h-40 w-40 rounded-xl bg-white p-2" />
      <button
        type="button"
        onClick={handleSave}
        className="rounded-full border border-shop-blush-200 bg-white px-4 py-1.5 text-xs font-medium text-shop-text transition-colors hover:bg-shop-blush-50"
      >
        บันทึกรูป QR
      </button>
      <p className="text-center text-[11px] text-shop-text-soft">
        หรือแตะรูป QR ค้างไว้แล้วเลือก &ldquo;บันทึกรูปภาพ&rdquo;
      </p>
    </div>
  );
}
