"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { buildPromptPayPayload } from "@/lib/promptpay";
import { formatPrice } from "@/lib/format";

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(header)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

export default function PromptPayQr({
  promptPayId,
  amount,
}: {
  promptPayId: string;
  amount: number;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
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
        if (cancelled) return;
        setDataUrl(url);
        // Built here (ahead of any tap) so the share button below can call
        // navigator.share() synchronously with no intervening await — iOS
        // Safari silently rejects share() once the user-activation window
        // from the tap has lapsed, which an awaited fetch()-to-blob would do.
        setFile(dataUrlToFile(url, "promptpay-qr.png"));
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl(null);
          setFile(null);
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

  function handleSave() {
    if (!dataUrl) return;

    // iOS Safari's <a download> saves to the Files app instead of Photos
    // (or does nothing, depending on version) — the Web Share API with a
    // real file attached opens the native share sheet instead, which has
    // "Save Image" saving straight to Photos. Must call share() with zero
    // awaits first: it silently throws once the tap's user-activation
    // window has lapsed, which is why the file is precomputed on generation
    // rather than converted from dataUrl here.
    if (file && navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file] }).catch(() => {
        // Sharing cancelled or failed — the long-press hint below still
        // works as a fallback, nothing further to do here.
      });
      return;
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
      <p className="text-sm font-semibold text-shop-text">
        ยอดที่ต้องโอน {formatPrice(amount)}
      </p>
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
