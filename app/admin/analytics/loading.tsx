import { SkeletonLine, SkeletonBlock } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <SkeletonLine className="h-5 w-32" />
      <SkeletonLine className="mt-2 h-3 w-full max-w-md" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
          <SkeletonLine className="h-2.5 w-28" />
          <SkeletonLine className="mt-2 h-6 w-24" />
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
          <SkeletonLine className="h-2.5 w-28" />
          <SkeletonLine className="mt-2 h-6 w-16" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <SkeletonLine className="h-3 w-40" />
        <SkeletonBlock className="mt-4 h-40 w-full" />
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <SkeletonLine className="h-3 w-44" />
        <div className="mt-4 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonLine key={i} className="h-2.5 w-full" />
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <SkeletonLine className="h-3 w-40" />
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map((i) => (
            <SkeletonLine key={i} className="h-3 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
