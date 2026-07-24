export type VariantWithProduct = {
  id: string;
  color_name: string;
  stock_quantity: number;
  products: { id: string; name: string; price: number } | null;
};

export type OrderLineInput = {
  variantId: string;
  quantity: number;
};

export type OrderItem = {
  variant_id: string;
  product_id: string;
  product_name: string;
  color_name: string;
  unit_price: number;
  quantity: number;
};

export type BuildOrderItemsResult =
  | { ok: true; orderItems: OrderItem[]; totalAmount: number }
  | { ok: false; error: string };

// Prices and stock are always taken from the DB-sourced variant map, never
// from client input — this is what stands between "trust the browser" and
// an order that can't be paid for the amount it claims.
export function buildOrderItems(
  items: OrderLineInput[],
  variantById: Map<string, VariantWithProduct>,
): BuildOrderItemsResult {
  const orderItems: OrderItem[] = [];
  let totalAmount = 0;

  for (const item of items) {
    const variant = variantById.get(item.variantId);
    const product = variant?.products;
    if (!variant || !product) {
      return { ok: false, error: "สินค้าบางรายการไม่มีอยู่แล้ว กรุณารีเฟรชตะกร้า" };
    }
    if (variant.stock_quantity < item.quantity) {
      return {
        ok: false,
        error: `"${product.name} (${variant.color_name})" เหลือไม่พอ (คงเหลือ ${variant.stock_quantity} ชิ้น)`,
      };
    }
    orderItems.push({
      variant_id: variant.id,
      product_id: product.id,
      product_name: product.name,
      color_name: variant.color_name,
      unit_price: Number(product.price),
      quantity: item.quantity,
    });
    totalAmount += Number(product.price) * item.quantity;
  }

  return { ok: true, orderItems, totalAmount };
}
