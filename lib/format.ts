export function formatPrice(baht: number): string {
  return `฿${baht.toLocaleString("th-TH")}`;
}
