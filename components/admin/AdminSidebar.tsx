"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminLogoutButton from "@/components/AdminLogoutButton";

const NAV_ITEMS = [
  { href: "/admin", label: "แดชบอร์ด" },
  { href: "/admin/orders", label: "คำสั่งซื้อ" },
];

export default function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-shop-blush-100 bg-white px-4 py-6">
      <p className="px-2 text-sm font-semibold tracking-wide text-shop-text">
        A GLEAM <span className="text-shop-blush-500">แอดมิน</span>
      </p>

      <nav className="mt-6 flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-shop-blush-50 text-shop-blush-600"
                  : "text-shop-text-soft hover:bg-shop-blush-50 hover:text-shop-text"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-shop-blush-100 pt-4">
        <p className="truncate px-2 text-xs text-shop-text-soft">{adminEmail}</p>
        <div className="mt-2">
          <AdminLogoutButton />
        </div>
      </div>
    </aside>
  );
}
