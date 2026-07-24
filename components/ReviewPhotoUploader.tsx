"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const MAX_SIZE = 5 * 1024 * 1024;

export default function ReviewPhotoUploader({
  userId,
  imageUrl,
  onChange,
}: {
  userId: string;
  imageUrl: string | null;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพ");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
      return;
    }

    setUploading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const ext = file.type.split("/")[1] || "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("review-photos")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        setError("อัปโหลดไม่สำเร็จ ลองใหม่อีกครั้ง");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("review-photos").getPublicUrl(path);
      onChange(publicUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {imageUrl ? (
        <div className="relative h-32 w-32 overflow-hidden rounded-xl ring-1 ring-shop-blush-100">
          <Image src={imageUrl} alt="" fill unoptimized className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white"
            aria-label="ลบรูป"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-32 w-32 items-center justify-center rounded-xl border border-dashed border-shop-blush-200 text-xs text-shop-text-soft hover:bg-shop-blush-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "กำลังอัปโหลด..." : "+ แนบรูปภาพ"}
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
