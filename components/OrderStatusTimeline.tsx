import { ORDER_STATUS_LABELS } from "@/lib/order-status";

const STEPS = [
  { status: "pending_verification", label: "รอตรวจสอบ" },
  { status: "confirmed", label: "ยืนยันแล้ว" },
  { status: "shipped", label: "จัดส่งแล้ว" },
  { status: "delivered", label: "จัดส่งสำเร็จ" },
] as const;

export default function OrderStatusTimeline({
  status,
  trackingNumber,
}: {
  status: string;
  trackingNumber?: string | null;
}) {
  // Rejected/returned are exceptions to the normal flow, not a step further
  // along it — showing them as a stage on the happy-path timeline would
  // misleadingly imply the order is still progressing normally.
  if (status === "rejected" || status === "returned") {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
        {ORDER_STATUS_LABELS[status] ?? status}
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div>
      <div className="flex items-start">
        {STEPS.map((step, i) => {
          const done = i <= currentIndex;
          const isLast = i === STEPS.length - 1;
          return (
            <div key={step.status} className="flex flex-1 items-start last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    done
                      ? "bg-shop-blush-500 text-white"
                      : "bg-shop-beige-100 text-shop-text-soft"
                  }`}
                >
                  {done ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`w-16 text-center text-[11px] leading-tight ${
                    done ? "font-medium text-shop-text" : "text-shop-text-soft"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mt-3.5 h-0.5 flex-1 transition-colors ${
                    i < currentIndex ? "bg-shop-blush-500" : "bg-shop-beige-100"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {trackingNumber && (
        <p className="mt-3 text-xs text-shop-text-soft">เลขพัสดุ: {trackingNumber}</p>
      )}
    </div>
  );
}
