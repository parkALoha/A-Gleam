import { SkeletonLine, SkeletonBlock, SkeletonCard } from "@/components/admin/Skeleton";

// Doubles as the fallback for the dashboard itself (this segment's own
// page.tsx) and for any nested admin page without a more specific
// loading.tsx of its own.
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <SkeletonLine className="h-5 w-40" />
      <SkeletonLine className="mt-2 h-3 w-56" />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBlock key={i} className="h-20" />
        ))}
      </div>

      <div className="mt-4 space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
