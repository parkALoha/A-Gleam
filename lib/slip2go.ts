import "server-only";

export type SlipVerificationStatus = "verified" | "amount_mismatch" | "fraud" | "error";

export type SlipVerificationResult = {
  status: SlipVerificationStatus;
  raw: unknown;
};

const ENDPOINT = "https://connect.slip2go.com/api/verify-slip/qr-image/info";

/**
 * Calls Slip2Go's slip-verification API and classifies the result.
 *
 * We only trust two things confidently from their response: the "200500 /
 * fraud" code (a clear reject), and `data.amount` (the amount their OCR/QR
 * read off the slip) — which we compare against our own order total
 * ourselves rather than relying on an unverified pass/fail flag in their
 * response. Anything that doesn't fit one of those shapes comes back as
 * "error" so the caller falls back to manual review instead of guessing.
 */
export async function verifySlip(
  imageBuffer: Buffer,
  mimeType: string,
  expectedAmount: number,
): Promise<SlipVerificationResult> {
  const secretKey = process.env.SLIP2GO_SECRET_KEY;
  if (!secretKey) {
    return { status: "error", raw: null };
  }

  try {
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([new Uint8Array(imageBuffer)], { type: mimeType }),
      "slip",
    );
    formData.append(
      "payload",
      JSON.stringify({
        checkAmount: { type: "eq", amount: expectedAmount },
        checkDuplicate: true,
      }),
    );

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}` },
      body: formData,
    });

    const json: unknown = await res.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return { status: "error", raw: json };
    }

    const code = (json as { code?: string }).code;
    if (code === "200500") {
      return { status: "fraud", raw: json };
    }

    const amount = (json as { data?: { amount?: unknown } }).data?.amount;
    if (typeof amount !== "number") {
      return { status: "error", raw: json };
    }

    const matches = Math.abs(amount - expectedAmount) < 0.01;
    return { status: matches ? "verified" : "amount_mismatch", raw: json };
  } catch {
    return { status: "error", raw: null };
  }
}
