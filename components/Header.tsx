import Link from "next/link";
import Image from "next/image";
import CartIndicator from "@/components/CartIndicator";

export default function Header() {
  return (
    <header className="sticky top-0 z-10">
      <div className="bg-shop-blush-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="w-20 sm:w-28" aria-hidden />
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/brand/logo-mark-dark.png"
              alt=""
              width={44}
              height={44}
              unoptimized
              className="h-9 w-9 sm:h-10 sm:w-10"
            />
            <span className="text-xl font-semibold tracking-widest text-shop-text sm:text-2xl">
              AGLEAMIN3011
            </span>
          </Link>
          <div className="flex w-20 items-center justify-end gap-4 sm:w-28">
            <span
              className="text-shop-text/70"
              title="บัญชีของฉัน (เร็วๆ นี้)"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
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
            </span>
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
            href="/#products"
            className="relative py-1 transition-colors hover:text-shop-blush-600 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-shop-blush-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            สินค้าใหม่
          </Link>
          <Link
            href="/#products"
            className="relative py-1 transition-colors hover:text-shop-blush-600 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-shop-blush-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            เสื้อทั้งหมด
          </Link>
          <Link
            href="/#products"
            className="relative py-1 transition-colors hover:text-shop-blush-600 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-shop-blush-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            SALE
          </Link>
        </nav>
      </div>
    </header>
  );
}
