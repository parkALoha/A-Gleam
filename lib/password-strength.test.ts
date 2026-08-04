import { describe, it, expect } from "vitest";
import { isPasswordStrong } from "@/lib/password-strength";

describe("isPasswordStrong", () => {
  it("rejects passwords missing a required character class", () => {
    expect(isPasswordStrong("abc12345")).toBe(false); // no uppercase, no symbol
    expect(isPasswordStrong("ABC12345")).toBe(false); // no lowercase, no symbol
    expect(isPasswordStrong("Abcdefgh")).toBe(false); // no digit, no symbol
    expect(isPasswordStrong("Abcdefg1")).toBe(false); // no symbol
  });

  it("rejects passwords under 8 characters even with every class present", () => {
    expect(isPasswordStrong("Ab1!def")).toBe(false);
  });

  it("accepts a password satisfying every rule", () => {
    expect(isPasswordStrong("Abcdefg1!")).toBe(true);
  });
});
