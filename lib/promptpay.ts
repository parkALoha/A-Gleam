// Thai PromptPay QR payload, built to the EMV QR Code for Payment Systems
// spec (the same format every Thai banking app can already scan) — no
// external service call needed, this is a pure, deterministic encoding.

function tlv(id: string, value: string): string {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

// CRC-16/CCITT-FALSE: poly 0x1021, init 0xFFFF, no reflection — the
// checksum algorithm the spec requires for the final "63" field.
export function crc16ccitt(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function formatPromptPayId(id: string): { subTag: string; value: string } {
  const digits = id.replace(/\D/g, "");

  if (digits.length === 13) {
    // National ID / Tax ID — used as-is.
    return { subTag: "02", value: digits };
  }

  if (digits.length === 10 && digits.startsWith("0")) {
    // Mobile number — country code 66 + the number without its leading 0.
    return { subTag: "01", value: `0066${digits.slice(1)}` };
  }

  throw new Error("PromptPay ID ต้องเป็นเบอร์โทร 10 หลัก หรือเลขบัตรประชาชน 13 หลัก");
}

function buildMerchantAccountInfo(promptPayId: string): string {
  const aid = tlv("00", "A000000677010111");
  const { subTag, value } = formatPromptPayId(promptPayId);
  return tlv("29", aid + tlv(subTag, value));
}

/**
 * Builds a dynamic (one-time, fixed-amount) PromptPay QR payload string —
 * the exact text a QR-code image is generated from. Scanning it in any Thai
 * banking app pre-fills both the receiving PromptPay ID and this amount.
 */
export function buildPromptPayPayload(promptPayId: string, amount: number): string {
  const parts = [
    tlv("00", "01"), // Payload Format Indicator
    tlv("01", "12"), // Point of Initiation Method: 12 = dynamic (has a fixed amount)
    buildMerchantAccountInfo(promptPayId),
    tlv("53", "764"), // Transaction Currency: 764 = THB
    tlv("54", amount.toFixed(2)), // Transaction Amount
    tlv("58", "TH"), // Country Code
  ];
  const withoutCrc = parts.join("") + "6304";
  return withoutCrc + crc16ccitt(withoutCrc);
}
