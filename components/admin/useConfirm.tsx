"use client";

import { useCallback, useRef, useState } from "react";

// In-page replacement for window.confirm() — native confirm/alert dialogs
// render unreliably (or not at all) inside LINE/Facebook/Instagram in-app
// browsers, which is exactly where a shared mobile link tends to get opened.
export function useConfirm() {
  const [message, setMessage] = useState<string | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((msg: string) => {
    setMessage(msg);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function handle(result: boolean) {
    setMessage(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }

  const dialog = message ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
        <p className="text-sm text-shop-text">{message}</p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => handle(false)}
            className="flex-1 rounded-full border border-shop-blush-200 px-4 py-2 text-sm font-medium text-shop-text hover:bg-shop-blush-50"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() => handle(true)}
            className="flex-1 rounded-full bg-shop-blush-500 px-4 py-2 text-sm font-semibold text-white hover:scale-[1.02]"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, dialog };
}
