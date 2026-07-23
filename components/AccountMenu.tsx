"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function AccountMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="บัญชีของฉัน"
        className="text-shop-text/70 transition-colors hover:text-shop-blush-600"
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
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-xl bg-white py-1.5 text-sm text-shop-text shadow-lg ring-1 ring-shop-blush-100">
          <Link
            href="/account/orders"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 hover:bg-shop-blush-50"
          >
            ประวัติคำสั่งซื้อ
          </Link>
          <Link
            href="/account/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 hover:bg-shop-blush-50"
          >
            ข้อมูลส่วนตัว
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left hover:bg-shop-blush-50"
          >
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}
