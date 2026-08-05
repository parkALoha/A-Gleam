"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Only fires when the root layout itself throws — a rarer case than the
// regular error.tsx boundaries nested under it, but Sentry's docs flag this
// as the one spot those boundaries can't reach, so it needs its own
// captureException. Replaces the whole document, hence its own html/body.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="th">
      <body>
        <div style={{ padding: "4rem 1.25rem", textAlign: "center" }}>
          <p>เกิดข้อผิดพลาด กรุณาลองรีเฟรชหน้าใหม่</p>
        </div>
      </body>
    </html>
  );
}
