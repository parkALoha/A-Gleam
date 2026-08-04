"use client";

import { useLinkStatus } from "next/link";

// Must be a descendant of the <Link> it reports on — useLinkStatus reads
// context that only the nearest ancestor Link provides. Reserves its own
// space (not conditionally rendered) so nothing shifts when it appears.
export default function NavLinkPendingDot() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`ml-1 inline-block h-1.5 w-1.5 rounded-full bg-shop-blush-500 transition-opacity ${
        pending ? "animate-pulse opacity-100" : "opacity-0"
      }`}
    />
  );
}
