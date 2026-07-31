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

  useEffect(() => {
    if (amount <= 0) return;
    let cancelled = false;

    Promise.resolve()
      .then(() => buildPromptPayPayload(promptPayId, amount))
      .then((payload) => QRCode.toDataURL(payload, { margin: 1, width: 320 }))
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [promptPayId, amount]);

  if (amount <= 0 || !dataUrl) {
    return (
      <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-white text-xs text-shop-text-soft">
        กำลังสร้าง QR...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- a locally-generated data: URI, not an optimizable remote image */}
      <img src={dataUrl} alt="QR พร้อมเพย์" className="h-40 w-40 rounded-xl bg-white p-2" />
      <a
        href={dataUrl}
        download="promptpay-qr.png"
        className="rounded-full border border-shop-blush-200 bg-white px-4 py-1.5 text-xs font-medium text-shop-text transition-colors hover:bg-shop-blush-50"
      >
        บันทึกรูป QR
      </a>
    </div>
  );
}
