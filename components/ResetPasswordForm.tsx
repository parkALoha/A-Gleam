"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";
import PasswordStrengthChecklist from "@/components/PasswordStrengthChecklist";
import { translateAuthError } from "@/lib/auth-errors";
import { isPasswordStrong } from "@/lib/password-strength";

type Status = "waiting" | "ready" | "invalid" | "done";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("waiting");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    // Supabase's recovery link arrives as either a PKCE ?code= or a legacy
    // #access_token=/#refresh_token= hash fragment depending on how it was
    // issued. Rather than trust the client library to auto-detect the hash
    // case (timing-sensitive: it only fires if this exact client instance
    // was the one constructed while the hash was still in the URL), parse
    // and establish the session explicitly either way — deterministic
    // regardless of what else on the page touched auth first.
    async function establishSession() {
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        setStatus(error ? "invalid" : "ready");
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken && hashParams.get("type") === "recovery") {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        setStatus(error ? "invalid" : "ready");
        return;
      }

      setStatus("invalid");
    }

    establishSession();
    // Only run once on mount — the code/token is single-use, re-running on
    // searchParams identity changes would just fail the second time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    setSubmitting(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(translateAuthError(updateError, "ตั้งรหัสผ่านใหม่ไม่สำเร็จ ลองใหม่อีกครั้ง"));
        return;
      }

      setStatus("done");
      setTimeout(() => router.push("/account/orders"), 1500);
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "waiting") {
    return <p className="mt-10 text-center text-sm text-shop-text-soft">กำลังตรวจสอบลิงก์...</p>;
  }

  if (status === "invalid") {
    return (
      <div className="mx-auto mt-10 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-shop-blush-100">
        <p className="font-medium text-shop-text">ลิงก์นี้ใช้ไม่ได้แล้ว</p>
        <p className="mt-1 text-sm text-shop-text-soft">
          ลิงก์ตั้งรหัสผ่านใหม่อาจหมดอายุหรือถูกใช้ไปแล้ว กรุณาขอลิงก์ใหม่อีกครั้ง
        </p>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="mx-auto mt-10 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-shop-blush-100">
        <p className="font-medium text-shop-text">ตั้งรหัสผ่านใหม่สำเร็จ ✓</p>
        <p className="mt-1 text-sm text-shop-text-soft">กำลังพาไปหน้าคำสั่งซื้อ...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-shop-blush-100"
    >
      <h1 className="text-lg font-semibold text-shop-text">ตั้งรหัสผ่านใหม่</h1>

      <div className="mt-4">
        <label className="text-sm font-medium text-shop-text" htmlFor="new_password">
          รหัสผ่านใหม่
        </label>
        <div className="mt-1.5">
          <PasswordInput
            id="new_password"
            value={password}
            onChange={setPassword}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <PasswordStrengthChecklist password={password} />
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-shop-text" htmlFor="new_password_confirm">
          ยืนยันรหัสผ่านใหม่
        </label>
        <div className="mt-1.5">
          <PasswordInput
            id="new_password_confirm"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-full bg-shop-blush-500 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
      </button>
    </form>
  );
}
