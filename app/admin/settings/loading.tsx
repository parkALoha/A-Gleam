import { SkeletonLine, SkeletonBlock } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <SkeletonLine className="h-5 w-28" />

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <SkeletonLine className="h-3 w-40" />
        <SkeletonLine className="mt-2 h-2.5 w-full" />
        <SkeletonBlock className="mt-3 h-9 w-40" />
      </div>

      <div className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <SkeletonLine className="h-3 w-32" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <SkeletonLine className="h-2.5 w-24" />
            <SkeletonBlock className="mt-1.5 h-10 w-full" />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <SkeletonLine className="h-3 w-32" />
        <SkeletonBlock className="mt-3 h-24 w-full" />
      </div>
    </div>
  );
}
