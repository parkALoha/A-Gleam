"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

// Runs on the order confirmation page, not the checkout page — clearing the
// cart while CheckoutForm is still mounted made it briefly render its own
// "cart is empty" branch before the navigation to this page landed.
export default function ClearCartOnMount() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    // Only ever run once, right after this page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
