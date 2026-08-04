import { SkeletonLine, SkeletonBlock } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <SkeletonLine className="h-5 w-40" />

      <div className="mt-6 flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonBlock key={i} className="h-9 w-20" />
        ))}
      </div>

      <SkeletonBlock className="mt-4 h-11 w-full" />

      <div className="mt-6 space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100"
          >
            <div className="flex items-start justify-between gap-3">
              <SkeletonLine className="h-3.5 w-28" />
              <SkeletonLine className="h-5 w-20" />
            </div>
            <SkeletonLine className="mt-2.5 h-3 w-40" />
            <div className="mt-3 flex items-center justify-between border-t border-shop-blush-100 pt-3">
              <SkeletonLine className="h-2.5 w-32" />
              <SkeletonLine className="h-3.5 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
