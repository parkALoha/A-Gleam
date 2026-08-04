"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";
import PasswordStrengthChecklist from "@/components/PasswordStrengthChecklist";
import SocialAuthButtons from "@/components/SocialAuthButtons";
import { thaiInvalidMessage, clearCustomValidity } from "@/lib/form-validation";
import { translateAuthError } from "@/lib/auth-errors";
import { isPasswordStrong } from "@/lib/password-strength";

export default function CreateAccountForm({
  orderNumber,
  phone,
}: {
  orderNumber: string;
  phone: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }

    if (!isPasswordStrong(password)) {
      setError("รหัสผ่านยังไม่ตรงตามเงื่อนไขความปลอดภัยด้านล่าง");
      return;
    }

    if (!agreed) {
      setError("กรุณายอมรับนโยบายความเป็นส่วนตัวและข้อกำหนดการใช้งานก่อน");
      return;
    }

    setSubmitting(true);

    const supabase = createBrowserSupabaseClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setError(signUpError ? translateAuthError(signUpError) : "สมัครไม่สำเร็จ ลองใหม่อีกครั้ง");
      setSubmitting(false);
      return;
    }

    const linkRes = await fetch("/api/account/link-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, phone }),
    });

    if (!linkRes.ok) {
      // Account was created either way — the order just didn't link, which
      // isn't fatal, so don't block the "account created" confirmation.
      setError(null);
    }

    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="mt-6 rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-shop-blush-100">
        <p className="font-medium text-shop-text">สร้างบัญชีสำเร็จ 🎉</p>
        <p className="mt-1 text-sm text-shop-text-soft">
          ครั้งหน้าล็อกอินแล้วสั่งซื้อได้เลย ไม่ต้องกรอกที่อยู่ใหม่
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100"
    >
      <p className="font-medium text-shop-text">
        สร้างบัญชีเพื่อบันทึกไว้ใช้ครั้งหน้า
      </p>
      <p className="mt-1 text-xs text-shop-text-soft">
        ไม่ต้องกรอกชื่อ/เบอร์/ที่อยู่ซ้ำ — ระบบดึงจากคำสั่งซื้อนี้ให้อัตโนมัติ
      </p>

      <div className="mt-4">
        <label className="text-sm font-medium text-shop-text" htmlFor="signup_email">
          อีเมล
        </label>
        <input
          id="signup_email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onInvalid={thaiInvalidMessage}
          onInput={clearCustomValidity}
          className="mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500"
        />
      </div>

      <div className="mt-3">
        <label className="text-sm font-medium text-shop-text" htmlFor="signup_password">
          ตั้งรหัสผ่าน
        </label>
        <div className="mt-1.5">
          <PasswordInput
            id="signup_password"
            value={password}
            onChange={setPassword}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <PasswordStrengthChecklist password={password} />
      </div>

      <div className="mt-3">
        <label className="text-sm font-medium text-shop-text" htmlFor="signup_password_confirm">
          ยืนยันรหัสผ่านอีกครั้ง
        </label>
        <div className="mt-1.5">
          <PasswordInput
            id="signup_password_confirm"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      </div>

      <label className="mt-3 flex items-start gap-2 text-xs text-shop-text-soft">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          ฉันยอมรับ{" "}
          <a href="/privacy-policy" target="_blank" className="text-shop-blush-600 underline">
            นโยบายความเป็นส่วนตัว
          </a>{" "}
          และ{" "}
          <a href="/terms" target="_blank" className="text-shop-blush-600 underline">
            ข้อกำหนดการใช้งาน
          </a>
        </span>
      </label>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !agreed}
        className="mt-4 w-full rounded-full bg-shop-blush-500 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
      </button>

      <div className="my-4 flex items-center gap-3 text-xs text-shop-text-soft">
        <div className="h-px flex-1 bg-shop-blush-100" />
        หรือ
        <div className="h-px flex-1 bg-shop-blush-100" />
      </div>
      <SocialAuthButtons callbackParams={{ orderNumber, phone }} disabled={!agreed} />
    </form>
  );
}
