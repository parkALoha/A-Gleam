"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";
import SocialAuthButtons from "@/components/SocialAuthButtons";
import { thaiInvalidMessage, clearCustomValidity } from "@/lib/form-validation";
import { translateAuthError } from "@/lib/auth-errors";

export default function CustomerAuthForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");

  // Login state
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password: loginPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "อีเมล/เบอร์โทร หรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      router.push(data?.isAdmin ? "/admin" : "/account/orders");
      router.refresh();
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }

    if (!agreed) {
      setError("กรุณายอมรับนโยบายความเป็นส่วนตัวและข้อกำหนดการใช้งานก่อน");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(translateAuthError(signUpError));
        return;
      }

      router.push("/account/profile?welcome=1");
      router.refresh();
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-shop-blush-100">
      <div className="flex rounded-full bg-shop-blush-50 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => {
            setTab("login");
            setError(null);
          }}
          className={`flex-1 rounded-full py-2 transition-colors ${
            tab === "login" ? "bg-white text-shop-blush-600 shadow-sm" : "text-shop-text-soft"
          }`}
        >
          เข้าสู่ระบบ
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("signup");
            setError(null);
          }}
          className={`flex-1 rounded-full py-2 transition-colors ${
            tab === "signup" ? "bg-white text-shop-blush-600 shadow-sm" : "text-shop-text-soft"
          }`}
        >
          สมัครสมาชิก
        </button>
      </div>

      {tab === "login" ? (
        <form onSubmit={handleLogin} className="mt-5">
          <div>
            <label className="text-sm font-medium text-shop-text" htmlFor="identifier">
              อีเมล หรือ เบอร์โทร
            </label>
            <input
              id="identifier"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onInvalid={thaiInvalidMessage}
              onInput={clearCustomValidity}
              className="mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-shop-text" htmlFor="login_password">
              รหัสผ่าน
            </label>
            <div className="mt-1.5">
              <PasswordInput
                id="login_password"
                value={loginPassword}
                onChange={setLoginPassword}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-shop-blush-500 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-shop-blush-100" />
            <span className="text-xs text-shop-text-soft">หรือ</span>
            <div className="h-px flex-1 bg-shop-blush-100" />
          </div>

          <SocialAuthButtons />
        </form>
      ) : (
        <form onSubmit={handleSignup} className="mt-5">
          <div>
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

          <div className="mt-4">
            <label className="text-sm font-medium text-shop-text" htmlFor="signup_password">
              ตั้งรหัสผ่าน
            </label>
            <div className="mt-1.5">
              <PasswordInput
                id="signup_password"
                value={password}
                onChange={setPassword}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-shop-text" htmlFor="signup_password_confirm">
              ยืนยันรหัสผ่านอีกครั้ง
            </label>
            <div className="mt-1.5">
              <PasswordInput
                id="signup_password_confirm"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </div>

          <label className="mt-4 flex items-start gap-2 text-xs text-shop-text-soft">
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

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-shop-blush-100" />
            <span className="text-xs text-shop-text-soft">หรือ</span>
            <div className="h-px flex-1 bg-shop-blush-100" />
          </div>

          <SocialAuthButtons disabled={!agreed} />
        </form>
      )}
    </div>
  );
}
