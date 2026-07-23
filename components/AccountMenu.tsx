"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import AvatarBadge from "@/components/AvatarBadge";

export default function AccountMenu({
  avatarUrl,
  fallbackLabel,
}: {
  avatarUrl: string | null;
  fallbackLabel: string;
}) {
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
        className="block transition-opacity hover:opacity-80"
      >
        <AvatarBadge avatarUrl={avatarUrl} label={fallbackLabel} size={28} />
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
