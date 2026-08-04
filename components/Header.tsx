import Link from "next/link";
import Image from "next/image";
import CartIndicator from "@/components/CartIndicator";
import SearchOverlay from "@/components/SearchOverlay";
import HeaderAccountSlot from "@/components/HeaderAccountSlot";
import NavLinkPendingDot from "@/components/NavLinkPendingDot";

// Deliberately not fetching auth state here (no cookies()/server client) —
// the account icon resolves client-side instead (HeaderAccountSlot), so
// Header no longer forces every page that includes it into full dynamic
// rendering just to know whether *someone* is logged in.
export default function Header() {
  return (
    <header className="sticky top-0 z-10">
      <div className="bg-shop-blush-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          {/* Only reserved on desktop, to balance the icon group so the
              wordmark sits centered. On mobile there's no third column, so
              the wordmark lands at the left edge instead of fighting the
              icon group for centered space. */}
          <div className="hidden sm:block sm:w-32" aria-hidden />
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <Image
              src="/brand/logo-mark-dark.png"
              alt=""
              width={44}
              height={44}
              className="h-9 w-9 sm:h-10 sm:w-10"
            />
            <span className="text-base font-semibold tracking-wide text-shop-text sm:text-2xl sm:tracking-widest">
              AGLEAMIN3011
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:w-32 sm:justify-end sm:gap-4">
            <SearchOverlay />
            <CartIndicator />
            <HeaderAccountSlot />
          </div>
        </div>
      </div>

      <div className="border-b border-shop-blush-100 bg-shop-cream/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-center gap-4 overflow-x-auto px-5 py-3 text-sm font-medium text-nowrap text-shop-text sm:gap-6">
          <Link
            href="/"
            className="relative shrink-0 py-1 transition-colors hover:text-shop-blush-600 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-shop-blush-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            หน้าแรก
            <NavLinkPendingDot />
          </Link>
          <Link
            href="/collections/new"
            className="relative shrink-0 py-1 transition-colors hover:text-shop-blush-600 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-shop-blush-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            สินค้าใหม่
            <NavLinkPendingDot />
          </Link>
          <Link
            href="/collections/bestseller"
            className="relative shrink-0 py-1 transition-colors hover:text-shop-blush-600 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-shop-blush-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            ขายดี
            <NavLinkPendingDot />
          </Link>
          <Link
            href="/collections/all"
            className="relative shrink-0 py-1 transition-colors hover:text-shop-blush-600 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-shop-blush-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            สินค้าทั้งหมด
            <NavLinkPendingDot />
          </Link>
          <Link
            href="/collections/sale"
            className="relative shrink-0 py-1 transition-colors hover:text-shop-blush-600 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-shop-blush-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            SALE
            <NavLinkPendingDot />
          </Link>
        </nav>
      </div>
    </header>
  );
}
