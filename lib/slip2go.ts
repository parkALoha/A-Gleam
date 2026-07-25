import "server-only";

export type SlipVerificationStatus = "verified" | "amount_mismatch" | "fraud" | "error";

export type SlipVerificationResult = {
  status: SlipVerificationStatus;
  raw: unknown;
};

export type ReceiverConfig = {
  bankCode: string;
  accountNumber: string;
  accountNameTH: string;
};

const ENDPOINT = "https://connect.slip2go.com/api/verify-slip/qr-image/info";

// Slip2Go's checkReceiver wants the name without a Thai honorific title.
const THAI_TITLE_PREFIX = /^(นาย|นาง|นางสาว|น\.ส\.|บริษัท|ห้างหุ้นส่วนจำกัด|หจก\.)\s*/;
function stripThaiTitle(name: string): string {
  return name.replace(THAI_TITLE_PREFIX, "").trim();
}

/**
 * Calls Slip2Go's slip-verification API and classifies the result.
 *
 * We only trust two things confidently from their response: the "200500 /
 * fraud" code (a clear reject), and `data.amount` (the amount their OCR/QR
 * read off the slip) — which we compare against our own order total
 * ourselves rather than relying on an unverified pass/fail flag in their
 * response. Anything that doesn't fit one of those shapes comes back as
 * "error" so the caller falls back to manual review instead of guessing.
 *
 * `receiver`, when given, is sent as checkReceiver so Slip2Go also checks
 * the money landed in the shop's own account — but we don't yet have a
 * confirmed field/code for how a receiver mismatch shows up in the
 * response (no real slip was available to test against), so a mismatch
 * there most likely surfaces as a non-standard response and falls through
 * to "error" (safe: it just means manual review instead of a specific
 * "wrong account" label).
 */
export async function verifySlip(
  imageBuffer: Buffer,
  mimeType: string,
  expectedAmount: number,
  receiver?: ReceiverConfig,
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
        ...(receiver
          ? {
              checkReceiver: [
                {
                  accountType: receiver.bankCode,
                  accountNumber: receiver.accountNumber,
                  accountNameTH: stripThaiTitle(receiver.accountNameTH),
                },
              ],
            }
          : {}),
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
