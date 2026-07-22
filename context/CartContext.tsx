"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  lineId: string;
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  colorName: string;
  price: number;
  image: string;
  quantity: number;
  maxQuantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "lineId" | "quantity">, quantity?: number) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  changeVariant: (
    lineId: string,
    next: { variantId: string; colorName: string; image: string; maxQuantity: number },
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "a-gleam-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage on mount — SSR has no access to
    // it, so the empty initial state above is intentional and unavoidable.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: CartItem[] = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(
          parsed.map((i) => (i.lineId ? i : { ...i, lineId: crypto.randomUUID() })),
        );
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  function addItem(item: Omit<CartItem, "lineId" | "quantity">, quantity = 1) {
    setItems((current) => {
      const existing = current.find((i) => i.variantId === item.variantId);
      if (existing) {
        return current.map((i) =>
          i.variantId === item.variantId
            ? {
                ...i,
                quantity: Math.min(i.quantity + quantity, i.maxQuantity),
              }
            : i,
        );
      }
      return [
        ...current,
        {
          ...item,
          lineId: crypto.randomUUID(),
          quantity: Math.min(quantity, item.maxQuantity),
        },
      ];
    });
  }

  function removeItem(lineId: string) {
    setItems((current) => current.filter((i) => i.lineId !== lineId));
  }

  function updateQuantity(lineId: string, quantity: number) {
    setItems((current) =>
      current
        .map((i) =>
          i.lineId === lineId
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxQuantity)) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }

  function changeVariant(
    lineId: string,
    next: { variantId: string; colorName: string; image: string; maxQuantity: number },
  ) {
    setItems((current) => {
      // If the target color is already a separate line item, merge into it.
      const targetExisting = current.find(
        (i) => i.variantId === next.variantId && i.lineId !== lineId,
      );
      const source = current.find((i) => i.lineId === lineId);
      if (!source) return current;

      if (targetExisting) {
        const mergedQuantity = Math.min(
          targetExisting.quantity + source.quantity,
          next.maxQuantity,
        );
        return current
          .filter((i) => i.lineId !== lineId)
          .map((i) =>
            i.lineId === targetExisting.lineId
              ? { ...i, quantity: mergedQuantity }
              : i,
          );
      }

      return current.map((i) =>
        i.lineId === lineId
          ? {
              ...i,
              variantId: next.variantId,
              colorName: next.colorName,
              image: next.image,
              maxQuantity: next.maxQuantity,
              quantity: Math.min(i.quantity, next.maxQuantity),
            }
          : i,
      );
    });
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        changeVariant,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
