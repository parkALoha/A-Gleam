const BANGKOK_TZ = "Asia/Bangkok";

// Vercel's server runtime defaults to UTC, not Thailand's UTC+7 — using the
// process's local time (new Date().getDate(), toISOString(), etc.) for
// calendar-day logic silently buckets/labels anything in the local
// midnight-07:00 window under the wrong day. These helpers pin every
// calendar-day calculation to Bangkok time regardless of server TZ.
function bangkokDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

// "YYYY-MM-DD" for the given instant's Bangkok calendar date.
export function bangkokDateKey(date: Date): string {
  const { year, month, day } = bangkokDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// The UTC instant of local midnight (00:00 Bangkok time) on the given
// instant's Bangkok calendar date.
export function bangkokMidnightUtc(date: Date): Date {
  const { year, month, day } = bangkokDateParts(date);
  return new Date(Date.UTC(year, month - 1, day, -7, 0, 0));
}
