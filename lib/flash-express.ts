import "server-only";

// Mock stand-in for Flash Express's Open API (no merchant account yet).
// Once real credentials exist, replace the body of createShipment with an
// actual call to POST /open/v3/orders — the real API returns `pno` the
// same way this mock does, so nothing calling this needs to change.
export async function createShipment(orderNumber: string): Promise<{ trackingNumber: string }> {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return { trackingNumber: `MOCK-${orderNumber}-${random}` };
}
