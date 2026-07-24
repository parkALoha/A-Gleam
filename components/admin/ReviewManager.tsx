"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ImageUploader from "@/components/admin/ImageUploader";

export type ReviewItem = {
  id: string;
  customerHandle: string;
  imageUrl: string;
  caption: string | null;
  rating: number;
  isVisible: boolean;
  orderNumber?: string | null;
};

function ReviewRow({ review }: { review: ReviewItem }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(review);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerHandle: values.customerHandle,
          imageUrl: values.imageUrl,
          caption: values.caption,
          rating: values.rating,
          isVisible: values.isVisible,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setEditing(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleVisible() {
    setSubmitting(true);
    try {
      await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerHandle: review.customerHandle,
          imageUrl: review.imageUrl,
          caption: review.caption,
          rating: review.rating,
          isVisible: !review.isVisible,
        }),
      });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`ลบรีวิวของ "${review.customerHandle}" ถาวร?`)) return;
    setSubmitting(true);
    try {
      await fetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    "mt-1 w-full rounded-xl border border-shop-blush-100 bg-white px-3 py-2 text-sm text-shop-text outline-none focus:border-shop-blush-500";

  if (editing) {
    return (
      <div className="rounded-xl border border-shop-blush-100 p-4">
        <label className="text-xs text-shop-text-soft">ชื่อ/handle ลูกค้า</label>
        <input
          value={values.customerHandle}
          onChange={(e) => setValues((v) => ({ ...v, customerHandle: e.target.value }))}
          className={fieldClass}
        />
        <label className="mt-2 block text-xs text-shop-text-soft">ข้อความรีวิว</label>
        <input
          value={values.caption ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, caption: e.target.value }))}
          className={fieldClass}
        />
        <label className="mt-2 block text-xs text-shop-text-soft">คะแนน (1-5)</label>
        <input
          type="number"
          min={1}
          max={5}
          value={values.rating}
          onChange={(e) => setValues((v) => ({ ...v, rating: Number(e.target.value) }))}
          className={fieldClass}
        />
        <label className="mt-2 block text-xs text-shop-text-soft">รูปภาพ</label>
        <div className="mt-1">
          <ImageUploader
            images={values.imageUrl ? [values.imageUrl] : []}
            onChange={(images) => setValues((v) => ({ ...v, imageUrl: images[0] ?? "" }))}
          />
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="flex-1 rounded-full bg-shop-blush-500 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            บันทึก
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={submitting}
            className="flex-1 rounded-full border border-shop-blush-200 px-4 py-1.5 text-sm text-shop-text hover:bg-shop-blush-50"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-shop-blush-100 p-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-shop-beige-100">
        {review.imageUrl && (
          <Image src={review.imageUrl} alt="" fill unoptimized className="object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-shop-text">{review.customerHandle}</p>
        <p className="truncate text-xs text-shop-text-soft">{review.caption}</p>
        <p className="text-xs text-shop-text-soft">{"★".repeat(review.rating)}</p>
        {review.orderNumber && (
          <p className="text-xs text-shop-blush-600">จากออเดอร์ {review.orderNumber}</p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <button
          type="button"
          onClick={handleToggleVisible}
          disabled={submitting}
          className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-60 ${
            review.isVisible
              ? "bg-shop-blush-50 text-shop-blush-600"
              : "bg-shop-beige-100 text-shop-text-soft"
          }`}
        >
          {review.isVisible ? "แสดงอยู่" : "ซ่อนอยู่"}
        </button>
        <div className="flex gap-2 text-xs">
          <button type="button" onClick={() => setEditing(true)} className="text-shop-text-soft hover:underline">
            แก้ไข
          </button>
          <button type="button" onClick={handleDelete} className="text-red-500 hover:underline">
            ลบ
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewManager({ reviews }: { reviews: ReviewItem[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newHandle, setNewHandle] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newImage, setNewImage] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldClass =
    "mt-1 w-full rounded-xl border border-shop-blush-100 bg-white px-3 py-2 text-sm text-shop-text outline-none focus:border-shop-blush-500";

  async function handleAdd() {
    if (!newHandle.trim() || newImage.length === 0) {
      setError("กรุณากรอกชื่อและแนบรูปภาพ");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerHandle: newHandle,
          imageUrl: newImage[0],
          caption: newCaption,
          rating: newRating,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เพิ่มรีวิวไม่สำเร็จ");
        return;
      }
      setNewHandle("");
      setNewCaption("");
      setNewRating(5);
      setNewImage([]);
      setAdding(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
      <div className="flex items-center justify-between">
        <p className="font-medium text-shop-text">รีวิวลูกค้า</p>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="rounded-full border border-shop-blush-200 px-4 py-1.5 text-sm font-medium text-shop-text hover:bg-shop-blush-50"
        >
          {adding ? "ยกเลิก" : "+ เพิ่มรีวิว"}
        </button>
      </div>

      {adding && (
        <div className="mt-3 rounded-xl border border-shop-blush-100 p-4">
          <label className="text-xs text-shop-text-soft">ชื่อ/handle ลูกค้า</label>
          <input
            value={newHandle}
            onChange={(e) => setNewHandle(e.target.value)}
            className={fieldClass}
          />
          <label className="mt-2 block text-xs text-shop-text-soft">ข้อความรีวิว</label>
          <input
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            className={fieldClass}
          />
          <label className="mt-2 block text-xs text-shop-text-soft">คะแนน (1-5)</label>
          <input
            type="number"
            min={1}
            max={5}
            value={newRating}
            onChange={(e) => setNewRating(Number(e.target.value))}
            className={fieldClass}
          />
          <label className="mt-2 block text-xs text-shop-text-soft">รูปภาพ</label>
          <div className="mt-1">
            <ImageUploader images={newImage} onChange={setNewImage} />
          </div>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          <button
            type="button"
            onClick={handleAdd}
            disabled={submitting}
            className="mt-3 w-full rounded-full bg-shop-blush-500 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "กำลังเพิ่ม..." : "เพิ่มรีวิว"}
          </button>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-shop-text-soft">ยังไม่มีรีวิว</p>
      ) : (
        <div className="mt-4 space-y-2">
          {reviews.map((review) => (
            <ReviewRow key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
