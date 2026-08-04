"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import AccountMenu from "@/components/AccountMenu";

type State =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; avatarUrl: string | null; fallbackLabel: string; isAdmin: boolean };

export default function HeaderAccountSlot() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    // getSession() reads the locally-stored session with no network round
    // trip, unlike getUser() which re-validates against the Supabase auth
    // server every time — worth the tradeoff here since this only decides
    // which icon to show optimistically. Every actual privileged action
    // (admin pages, order APIs, etc.) still re-checks with getUser() or
    // getAdminUser() server-side regardless of what this shows.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user;
      if (!user) {
        setState({ status: "signed-out" });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, full_name, is_admin")
        .eq("id", user.id)
        .maybeSingle();

      setState({
        status: "signed-in",
        avatarUrl: profile?.avatar_url ?? null,
        fallbackLabel: profile?.full_name || user.email || "",
        isAdmin: profile?.is_admin ?? false,
      });
    });
  }, []);

  if (state.status === "loading") {
    // Same footprint as the real icon so the header doesn't jump once the
    // actual auth state resolves a moment later.
    return <span className="block h-7 w-7 sm:h-6 sm:w-6" aria-hidden />;
  }

  if (state.status === "signed-out") {
    return (
      <Link
        href="/login"
        aria-label="เข้าสู่ระบบ"
        className="rounded-full p-1.5 text-shop-text/70 transition-colors hover:bg-shop-blush-50 hover:text-shop-blush-600"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 sm:h-6 sm:w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      </Link>
    );
  }

  return (
    <AccountMenu
      avatarUrl={state.avatarUrl}
      fallbackLabel={state.fallbackLabel}
      isAdmin={state.isAdmin}
    />
  );
}
