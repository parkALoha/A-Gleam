import { SkeletonLine, SkeletonBlock } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <SkeletonLine className="h-3 w-32" />

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-shop-blush-100">
        <div className="flex items-start justify-between">
          <SkeletonLine className="h-5 w-32" />
          <SkeletonLine className="h-5 w-24" />
        </div>
        <SkeletonLine className="mt-3 h-3 w-48" />
        <SkeletonLine className="mt-2 h-3 w-40" />

        <SkeletonBlock className="mt-5 h-56 w-full" />

        <div className="mt-5 space-y-2">
          <SkeletonLine className="h-3 w-full" />
          <SkeletonLine className="h-3 w-5/6" />
          <SkeletonLine className="h-3 w-2/3" />
        </div>

        <SkeletonBlock className="mt-6 h-10 w-full" />
      </div>
    </div>
  );
}
