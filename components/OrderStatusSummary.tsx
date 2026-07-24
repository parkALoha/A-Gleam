import Link from "next/link";

const ICONS: Record<string, React.ReactNode> = {
  pending: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M4.5 5.25h15a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5h-15a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 13.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75l8.25-4.5 8.25 4.5-8.25 4.5-8.25-4.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75v6.75l8.25 4.5m0-11.25v11.25m0-11.25l8.25-4.5m-8.25 4.5l8.25 4.5m0 0v-6.75m0 6.75L12 21" />
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM18.75 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 16.5V6.75a1.5 1.5 0 011.5-1.5h9a1.5 1.5 0 011.5 1.5v9.75m-12 0h12m-12 0h-1.5m13.5 0h3.375c.621 0 1.125-.504 1.125-1.125V13.5a1.5 1.5 0 00-.44-1.06l-2.69-2.69a1.5 1.5 0 00-1.06-.44H15.75" />
    </svg>
  ),
  return: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L4.5 10.5M4.5 10.5L9 6M4.5 10.5h9a6 6 0 010 12h-3" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export type SummaryItem = {
  status: string;
  icon: keyof typeof ICONS;
  label: string;
};

export default function OrderStatusSummary({
  title,
  baseHref,
  items,
  counts,
  viewAllHref,
}: {
  title: string;
  baseHref: string;
  items: SummaryItem[];
  counts: Record<string, number>;
  viewAllHref?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-shop-blush-100">
      <div className="flex items-center justify-between">
        <p className="font-medium text-shop-text">{title}</p>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm text-shop-blush-600 hover:underline">
            ดูทั้งหมด →
          </Link>
        )}
      </div>

      <div
        className="mt-4 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const count = counts[item.status] ?? 0;
          return (
            <Link
              key={item.status}
              href={`${baseHref}?status=${item.status}`}
              className="flex flex-col items-center gap-2 rounded-xl py-3 text-center transition-colors hover:bg-shop-blush-50"
            >
              <span className="relative text-shop-text">
                {ICONS[item.icon]}
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
                    {count}
                  </span>
                )}
              </span>
              <span className="text-xs text-shop-text-soft">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
