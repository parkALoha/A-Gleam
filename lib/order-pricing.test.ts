import { describe, it, expect } from "vitest";
import { buildOrderItems, type VariantWithProduct, type OrderLineInput } from "@/lib/order-pricing";

function variantMap(variants: VariantWithProduct[]) {
  return new Map(variants.map((v) => [v.id, v]));
}

describe("buildOrderItems", () => {
  it("calculates the total from the DB-sourced price, ignoring nothing from the client but the quantity", () => {
    const variants = variantMap([
      {
        id: "v1",
        color_name: "เบจ",
        stock_quantity: 10,
        products: { id: "p1", name: "เสื้อ A", price: 450 },
      },
    ]);

    const result = buildOrderItems([{ variantId: "v1", quantity: 2 }], variants);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.totalAmount).toBe(900);
    expect(result.orderItems).toEqual([
      {
        variant_id: "v1",
        product_id: "p1",
        product_name: "เสื้อ A",
        color_name: "เบจ",
        unit_price: 450,
        quantity: 2,
      },
    ]);
  });

  it("sums multiple line items correctly", () => {
    const variants = variantMap([
      { id: "v1", color_name: "เบจ", stock_quantity: 10, products: { id: "p1", name: "A", price: 100 } },
      { id: "v2", color_name: "ดำ", stock_quantity: 10, products: { id: "p2", name: "B", price: 250 } },
    ]);

    const result = buildOrderItems(
      [
        { variantId: "v1", quantity: 3 },
        { variantId: "v2", quantity: 1 },
      ],
      variants,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.totalAmount).toBe(3 * 100 + 250);
  });

  it("rejects when requested quantity exceeds stock", () => {
    const variants = variantMap([
      { id: "v1", color_name: "เบจ", stock_quantity: 2, products: { id: "p1", name: "เสื้อ A", price: 450 } },
    ]);

    const result = buildOrderItems([{ variantId: "v1", quantity: 5 }], variants);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("เหลือไม่พอ");
  });

  it("rejects when the variant no longer exists", () => {
    const result = buildOrderItems([{ variantId: "missing", quantity: 1 }], variantMap([]));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("ไม่มีอยู่แล้ว");
  });

  it("rejects when the variant's product has been deleted (products null)", () => {
    const variants = variantMap([
      { id: "v1", color_name: "เบจ", stock_quantity: 10, products: null },
    ]);

    const result = buildOrderItems([{ variantId: "v1", quantity: 1 }], variants);

    expect(result.ok).toBe(false);
  });

  it("never trusts a client-supplied price — total is always quantity × the variant's DB price", () => {
    const variants = variantMap([
      { id: "v1", color_name: "เบจ", stock_quantity: 10, products: { id: "p1", name: "เสื้อ A", price: 999 } },
    ]);

    // OrderLineInput has no price field at all, but even if something tried
    // to smuggle one through, buildOrderItems only ever reads price from
    // the variant map that was loaded from the database.
    const smuggledInput = { variantId: "v1", quantity: 1, price: 1 } as OrderLineInput & {
      price: number;
    };
    const result = buildOrderItems([smuggledInput], variants);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.totalAmount).toBe(999);
  });
});
