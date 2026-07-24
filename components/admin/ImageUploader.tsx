"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const MAX_SIZE = 5 * 1024 * 1024;

export default function ImageUploader({
  images,
  onChange,
  multiple = false,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setError(null);
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError("กรุณาเลือกไฟล์รูปภาพ");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
        return;
      }
    }

    setUploading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const uploaded: string[] = [];

      for (const file of files) {
        const ext = file.type.split("/")[1] || "jpg";
        const path = `products/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-media")
          .upload(path, file, { contentType: file.type });

        if (uploadError) {
          setError("อัปโหลดไม่สำเร็จ ลองใหม่อีกครั้ง");
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-media").getPublicUrl(path);
        uploaded.push(publicUrl);
      }

      onChange(multiple ? [...images, ...uploaded] : uploaded);
    } finally {
      setUploading(false);
    }
  }

  function handleRemove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={url} className="relative h-20 w-20 overflow-hidden rounded-xl ring-1 ring-shop-blush-100">
            <Image src={url} alt="" fill unoptimized className="object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
              aria-label="ลบรูป"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-shop-blush-200 text-xs text-shop-text-soft hover:bg-shop-blush-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "..." : "+ เพิ่มรูป"}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
