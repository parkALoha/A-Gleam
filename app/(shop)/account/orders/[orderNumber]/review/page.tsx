import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ReviewForm from "@/components/ReviewForm";

export default async function OrderReviewPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status")
    .eq("order_number", orderNumber)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!order) {
    notFound();
  }

  if (order.status !== "delivered") {
    redirect("/account/orders");
  }

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-lg px-5 py-10">
      <Link href="/account/orders" className="text-sm text-shop-text-soft hover:text-shop-blush-600">
        ← กลับไปประวัติคำสั่งซื้อ
      </Link>

      <h1 className="mt-2 text-2xl font-semibold text-shop-text">เขียนรีวิว</h1>

      <div className="mt-6">
        {existingReview ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-shop-blush-100">
            <p className="font-medium text-shop-text">คุณรีวิวออเดอร์นี้ไปแล้ว</p>
            <p className="mt-1 text-sm text-shop-text-soft">ขอบคุณสำหรับรีวิวนะคะ</p>
          </div>
        ) : (
          <ReviewForm orderId={order.id} orderNumber={order.order_number} userId={user.id} />
        )}
      </div>
    </div>
  );
}
