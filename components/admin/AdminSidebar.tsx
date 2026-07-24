"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminLogoutButton from "@/components/AdminLogoutButton";

const NAV_ITEMS = [
  { href: "/admin", label: "แดชบอร์ด" },
  { href: "/admin/orders", label: "คำสั่งซื้อ" },
  { href: "/admin/products", label: "สินค้า" },
];

export default function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex shrink-0 flex-col border-b border-shop-blush-100 bg-white px-4 py-4 print:hidden md:sticky md:top-0 md:h-screen md:w-56 md:overflow-y-auto md:border-b-0 md:border-r md:py-6">
      <div className="flex items-center justify-between md:block">
        <Link href="/admin" className="text-sm font-semibold tracking-wide text-shop-text hover:text-shop-blush-600">
          A GLEAM <span className="text-shop-blush-500">แอดมิน</span>
        </Link>
        <div className="md:hidden">
          <AdminLogoutButton />
        </div>
      </div>

      <nav className="mt-3 flex gap-1 overflow-x-auto md:mt-6 md:flex-1 md:flex-col md:space-y-1 md:overflow-visible">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
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

      <div className="mt-6 hidden border-t border-shop-blush-100 pt-4 md:block">
        <p className="truncate px-2 text-xs text-shop-text-soft">{adminEmail}</p>
        <div className="mt-2">
          <AdminLogoutButton />
        </div>
      </div>
    </aside>
  );
}
