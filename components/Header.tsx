import Link from "next/link";
import Image from "next/image";
import CartIndicator from "@/components/CartIndicator";
import SearchOverlay from "@/components/SearchOverlay";
import AccountMenu from "@/components/AccountMenu";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-10">
      <div className="bg-shop-blush-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="w-12 sm:w-32" aria-hidden />
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <Image
              src="/brand/logo-mark-dark.png"
              alt=""
              width={44}
              height={44}
              unoptimized
              className="h-7 w-7 sm:h-10 sm:w-10"
            />
            <span className="text-base font-semibold tracking-wide text-shop-text sm:text-2xl sm:tracking-widest">
              AGLEAMIN3011
            </span>
          </Link>
          <div className="flex w-12 items-center justify-end gap-1.5 sm:w-32 sm:gap-4">
            <SearchOverlay />
            {user ? (
              <AccountMenu />
            ) : (
              <Link
                href="/login"
                aria-label="เข้าสู่ระบบ"
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
              </Link>
            )}
            <CartIndicator />
          </div>
        </div>
      </div>

      <div className="border-b border-shop-blush-100 bg-shop-cream/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-center gap-6 px-5 py-3 text-sm font-medium text-shop-text">
          <Link
            href="/"
            className="relative py-1 transition-colors hover:text-shop-blush-600 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-shop-blush-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            หน้าแรก
          </Link>
          <Link
            href="/?tag=new#products"
            className="relative py-1 transition-colors hover:text-shop-blush-600 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-shop-blush-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            สินค้าใหม่
          </Link>
          <Link
            href="/?tag=bestseller#products"
            className="relative py-1 transition-colors hover:text-shop-blush-600 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-shop-blush-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            ขายดี
          </Link>
          <Link
            href="/?tag=all#products"
            className="relative py-1 transition-colors hover:text-shop-blush-600 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-shop-blush-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            สินค้าทั้งหมด
          </Link>
          <Link
            href="/?tag=sale#products"
            className="relative py-1 transition-colors hover:text-shop-blush-600 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-shop-blush-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            SALE
          </Link>
        </nav>
      </div>
    </header>
  );
}
