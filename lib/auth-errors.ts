import type { AuthError } from "@supabase/supabase-js";

const MESSAGES_BY_CODE: Record<string, string> = {
  user_already_exists: "อีเมลนี้เคยสมัครสมาชิกไปแล้ว",
  weak_password: "รหัสผ่านคาดเดาง่ายเกินไป กรุณาตั้งรหัสผ่านใหม่",
  email_address_invalid: "รูปแบบอีเมลไม่ถูกต้อง",
  validation_failed: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
  over_email_send_rate_limit: "ลองมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง",
  over_request_rate_limit: "ลองมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง",
  // Supabase uses this single code for both "wrong code" and "code expired"
  // — there's no way to tell the two apart from the response.
  otp_expired: "รหัสไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอรหัสใหม่",
};

// Supabase's own error messages are in English regardless of page language —
// map the ones a customer can actually hit during signup/reset to Thai, with
// a safe generic fallback (caller-supplied, since "signup failed" doesn't fit
// every call site) for anything else.
export function translateAuthError(
  error: Pick<AuthError, "code" | "message">,
  fallback = "สมัครสมาชิกไม่สำเร็จ ลองใหม่อีกครั้ง",
): string {
  if (error.code && MESSAGES_BY_CODE[error.code]) {
    return MESSAGES_BY_CODE[error.code];
  }
  return fallback;
}
