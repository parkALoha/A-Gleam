import { SkeletonLine, SkeletonBlock } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="flex items-center justify-between">
        <SkeletonLine className="h-5 w-32" />
        <SkeletonBlock className="h-9 w-32" />
      </div>

      <SkeletonBlock className="mt-4 h-11 w-full" />

      <div className="mt-6 space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-shop-blush-100"
          >
            <SkeletonBlock className="h-16 w-16 shrink-0" />
            <div className="min-w-0 flex-1">
              <SkeletonLine className="h-3.5 w-40" />
              <SkeletonLine className="mt-2 h-3 w-24" />
              <SkeletonLine className="mt-2 h-2.5 w-32" />
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <SkeletonBlock className="h-5 w-10" />
              <SkeletonBlock className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
