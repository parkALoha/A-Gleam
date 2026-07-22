export function generateOrderNumber(): string {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = crypto.randomUUID().slice(0, 4).toUpperCase();
  return `AG-${datePart}-${randomPart}`;
}
