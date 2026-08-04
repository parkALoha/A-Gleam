import "server-only";
import webpush from "web-push";
import { createServiceClient } from "@/lib/supabase/service";
import { getSiteUrl } from "@/lib/site-url";
import { formatPrice } from "@/lib/format";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

// web-push requires an https: or mailto: subject and throws at call time
// otherwise -- getSiteUrl() falls back to http://localhost:3000 in local
// dev/build (no Vercel env vars set), which isn't valid, so fall back to a
// placeholder mailto: there instead of crashing the build.
const siteUrl = getSiteUrl();
const VAPID_SUBJECT = siteUrl.startsWith("https://") ? siteUrl : "mailto:admin@example.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

/**
 * Best-effort push notification to every admin device subscribed for
 * new-order alerts — same pattern as sendOrderStatusEmail: silently does
 * nothing if VAPID keys aren't set up yet, and never throws, since a
 * notification failing must not undo an order that already saved fine.
 */
export async function notifyAdminsNewOrder(orderNumber: string, totalAmount: number) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  const supabase = createServiceClient();
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key");

  if (!subscriptions || subscriptions.length === 0) return;

  const payload = JSON.stringify({
    title: "มีออเดอร์ใหม่ 🎉",
    body: `${orderNumber} — ${formatPrice(totalAmount)}`,
    url: "/admin/orders",
  });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          payload,
        );
      } catch (error) {
        // 404/410 = the browser dropped this subscription (unsubscribed,
        // uninstalled, expired) — prune it so future sends don't keep
        // failing against a dead endpoint.
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }),
  );
}
