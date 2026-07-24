"use client";

import { useCallback, useRef, useState } from "react";

// In-page replacement for window.alert() — same reasoning as useConfirm:
// native dialogs are unreliable inside in-app browsers (LINE, Facebook,
// Instagram) that a shared mobile link commonly gets opened in.
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(null), 3000);
  }, []);

  const toast = message ? (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-shop-text px-4 py-2 text-sm text-white shadow-lg">
      {message}
    </div>
  ) : null;

  return { showToast, toast };
}
