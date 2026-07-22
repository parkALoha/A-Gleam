export function formatPrice(baht: number): string {
  return `฿${baht.toLocaleString("th-TH")}`;
}

const TAG_LABELS: Record<string, string> = {
  ใหม่: "NEW",
  ขายดี: "BEST SELLER",
  ลดราคา: "SALE",
};

export function formatTag(tag: string): string {
  return TAG_LABELS[tag] ?? tag;
}
