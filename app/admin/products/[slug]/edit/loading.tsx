import { SkeletonLine, SkeletonBlock } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <SkeletonLine className="h-3 w-36" />
      <SkeletonLine className="mt-3 h-5 w-32" />

      <div className="mt-6 space-y-5">
        <SkeletonBlock className="h-40 w-full" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i}>
            <SkeletonLine className="h-2.5 w-20" />
            <SkeletonBlock className="mt-1.5 h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
