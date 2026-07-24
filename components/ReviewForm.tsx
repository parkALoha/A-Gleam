"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReviewPhotoUploader from "@/components/ReviewPhotoUploader";

export default function ReviewForm({
  orderId,
  orderNumber,
  userId,
}: {
  orderId: string;
  orderNumber: string;
  userId: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!imageUrl) {
      setError("กรุณาแนบรูปภาพ");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, imageUrl, caption, rating }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ส่งรีวิวไม่สำเร็จ");
        return;
      }
      setDone(true);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-shop-blush-100">
        <p className="font-medium text-shop-text">ส่งรีวิวสำเร็จ 🎉</p>
        <p className="mt-1 text-sm text-shop-text-soft">
          ขอบคุณสำหรับรีวิว ทางร้านจะตรวจสอบก่อนนำไปแสดงที่หน้าแรก
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-shop-blush-100"
    >
      <p className="font-medium text-shop-text">รีวิวคำสั่งซื้อ {orderNumber}</p>

      <div className="mt-4">
        <p className="text-sm font-medium text-shop-text">ให้คะแนน</p>
        <div className="mt-1.5 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`text-2xl ${n <= rating ? "text-shop-blush-500" : "text-shop-blush-100"}`}
              aria-label={`${n} ดาว`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-shop-text" htmlFor="caption">
          ข้อความรีวิว (ไม่บังคับ)
        </label>
        <textarea
          id="caption"
          rows={3}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500"
        />
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-shop-text">รูปภาพ</p>
        <div className="mt-1.5">
          <ReviewPhotoUploader userId={userId} imageUrl={imageUrl} onChange={setImageUrl} />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-full bg-shop-blush-500 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "กำลังส่ง..." : "ส่งรีวิว"}
      </button>
    </form>
  );
}
