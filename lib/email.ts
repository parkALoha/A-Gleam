import "server-only";
import { Resend } from "resend";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Resend's own shared testing address — works with zero setup, but only
// delivers to the account owner's own inbox. Swap in a real "From" once a
// sending domain is verified in the Resend dashboard.
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "A GLEAM <onboarding@resend.dev>";

/**
 * Best-effort order-status email — silently does nothing if RESEND_API_KEY
 * isn't set yet (same pattern as lib/slip2go.ts for an unconfigured secret),
 * and never throws: a notification failing must not undo an order-status
 * change that already succeeded in the database.
 */
export async function sendOrderStatusEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string | null;
}) {
  if (!resend) return;

  const statusLabel = ORDER_STATUS_LABELS[params.status] ?? params.status;
  const trackingLine = params.trackingNumber
    ? `\nเลขพัสดุ: ${params.trackingNumber}`
    : "";

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `คำสั่งซื้อ ${params.orderNumber} — ${statusLabel}`,
      text: `สวัสดีคุณ ${params.customerName}\n\nคำสั่งซื้อ ${params.orderNumber} ของคุณตอนนี้: ${statusLabel}${trackingLine}\n\nเช็คสถานะได้ทุกเมื่อที่ /track-order\n\nขอบคุณที่อุดหนุน A GLEAM`,
    });
  } catch {
    // Best-effort — swallow and move on.
  }
}
