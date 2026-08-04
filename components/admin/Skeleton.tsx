export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-shop-beige-100 ${className}`} />;
}

export function SkeletonCircle({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-shop-beige-100 ${className}`} />;
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-shop-beige-100 ${className}`} />;
}

// Same card chrome used everywhere in admin (rounded-2xl bg-white ring) so
// the skeleton reads as "this exact page, still loading" instead of a
// generic placeholder unrelated to what's about to appear.
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100 ${className}`}
    >
      <SkeletonLine className="h-3 w-1/3" />
      <SkeletonLine className="mt-3 h-2.5 w-2/3" />
      <SkeletonLine className="mt-2 h-2.5 w-1/2" />
    </div>
  );
}
