"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { thaiInvalidMessage, clearCustomValidity } from "@/lib/form-validation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createBrowserSupabaseClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setSubmitting(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-20 w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-shop-blush-100"
    >
      <h1 className="text-lg font-semibold text-shop-text">
        เข้าสู่ระบบแอดมิน
      </h1>

      <div className="mt-5">
        <label className="text-sm font-medium text-shop-text" htmlFor="email">
          อีเมล
        </label>
        <input
          id="email"
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
        <label
          className="text-sm font-medium text-shop-text"
          htmlFor="password"
        >
          รหัสผ่าน
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onInvalid={thaiInvalidMessage}
          onInput={clearCustomValidity}
          className="mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500"
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-full bg-shop-blush-500 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
