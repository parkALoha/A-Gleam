"use client";

import { useRef, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import AvatarBadge from "@/components/AvatarBadge";

const MAX_SIZE = 3 * 1024 * 1024;

export default function AvatarUpload({
  userId,
  initialAvatarUrl,
  fallbackLabel,
}: {
  userId: string;
  initialAvatarUrl: string | null;
  fallbackLabel: string;
}) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
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
      setError("ไฟล์ใหญ่เกินไป (สูงสุด 3MB)");
      return;
    }

    setUploading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const ext = file.type.split("/")[1] || "jpg";
      const path = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        setError("อัปโหลดไม่สำเร็จ ลองใหม่อีกครั้ง");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      // Cache-bust so the new photo shows immediately even though the path
      // (and therefore the browser-cached URL) is the same every time.
      const freshUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: freshUrl })
        .eq("id", userId);

      if (updateError) {
        setError("บันทึกรูปไม่สำเร็จ ลองใหม่อีกครั้ง");
        return;
      }

      setAvatarUrl(freshUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <AvatarBadge avatarUrl={avatarUrl} label={fallbackLabel} size={64} />
      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-full border border-shop-blush-200 px-4 py-1.5 text-sm font-medium text-shop-text transition-colors hover:bg-shop-blush-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "กำลังอัปโหลด..." : "เปลี่ยนรูปโปรไฟล์"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
