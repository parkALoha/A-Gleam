import { describe, it, expect } from "vitest";
import { buildPromptPayPayload, crc16ccitt } from "@/lib/promptpay";

describe("crc16ccitt", () => {
  it("matches the standard CRC-16/CCITT-FALSE test vector", () => {
    // Well-known reference vector for this exact variant of CRC-16.
    expect(crc16ccitt("123456789")).toBe("29B1");
  });
});

describe("buildPromptPayPayload", () => {
  it("builds a self-consistent payload (recomputed CRC matches the trailing one)", () => {
    const payload = buildPromptPayPayload("0985089318", 450);
    const withoutCrc = payload.slice(0, -4);
    const trailingCrc = payload.slice(-4);
    expect(crc16ccitt(withoutCrc)).toBe(trailingCrc);
  });

  it("encodes a mobile number as country-code 66 + number without the leading 0", () => {
    const payload = buildPromptPayPayload("0985089318", 450);
    expect(payload).toContain("0066985089318");
  });

  it("encodes a 13-digit national ID as-is", () => {
    const payload = buildPromptPayPayload("2709900029101", 450);
    expect(payload).toContain("2709900029101");
  });

  it("includes the PromptPay merchant AID", () => {
    const payload = buildPromptPayPayload("0985089318", 450);
    expect(payload).toContain("A000000677010111");
  });

  it("formats the amount with two decimal places", () => {
    const payload = buildPromptPayPayload("0985089318", 450);
    expect(payload).toContain("5406450.00");
  });

  it("rejects an ID that isn't a valid phone or national ID length", () => {
    expect(() => buildPromptPayPayload("12345", 450)).toThrow();
  });
});
