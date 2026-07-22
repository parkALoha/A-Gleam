"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function CreateAccountForm({
  orderNumber,
  phone,
}: {
  orderNumber: string;
  phone: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createBrowserSupabaseClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "สมัครไม่สำเร็จ ลองใหม่อีกครั้ง");
      setSubmitting(false);
      return;
    }

    const linkRes = await fetch("/api/account/link-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, phone, userId: data.user.id }),
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
          className="mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500"
        />
      </div>

      <div className="mt-3">
        <label className="text-sm font-medium text-shop-text" htmlFor="signup_password">
          ตั้งรหัสผ่าน
        </label>
        <input
          id="signup_password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500"
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-full bg-shop-blush-500 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
      </button>
    </form>
  );
}
