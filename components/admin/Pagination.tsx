import Link from "next/link";

export default function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const linkClass =
    "rounded-full border border-shop-blush-200 px-4 py-1.5 font-medium text-shop-text hover:bg-shop-blush-50";
  const disabledClass =
    "rounded-full border border-shop-blush-100 px-4 py-1.5 font-medium text-shop-text-soft/50";

  return (
    <div className="mt-6 flex items-center justify-center gap-3 text-sm">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className={linkClass}>
          ก่อนหน้า
        </Link>
      ) : (
        <span className={disabledClass}>ก่อนหน้า</span>
      )}
      <span className="text-shop-text-soft">
        หน้า {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className={linkClass}>
          ถัดไป
        </Link>
      ) : (
        <span className={disabledClass}>ถัดไป</span>
      )}
    </div>
  );
}
