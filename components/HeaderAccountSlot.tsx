"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import AccountMenu from "@/components/AccountMenu";

type State =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; isAdmin: boolean };

export default function HeaderAccountSlot() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let cancelled = false;

    // onAuthStateChange fires once immediately with the current session
    // (event "INITIAL_SESSION") and again on every future sign-in/sign-out —
    // a one-time getSession() check would only ever see the state as of
    // mount, so logging out anywhere else on the page (the account menu's
    // own signOut() call) would leave this stuck showing "signed in" since
    // Header never remounts across client-side navigation.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user;
        if (!user) {
          setState({ status: "signed-out" });
          return;
        }

        supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (!cancelled) {
              setState({ status: "signed-in", isAdmin: profile?.is_admin ?? false });
            }
          });
      },
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
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

  return <AccountMenu isAdmin={state.isAdmin} />;
}
