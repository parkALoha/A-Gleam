import { bangkokDateKey } from "@/lib/bangkok-time";

export function generateOrderNumber(): string {
  const datePart = bangkokDateKey(new Date()).replace(/-/g, "");
  const randomPart = crypto.randomUUID().slice(0, 4).toUpperCase();
  return `AG-${datePart}-${randomPart}`;
}
