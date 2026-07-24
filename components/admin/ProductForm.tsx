"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import { thaiInvalidMessage, clearCustomValidity } from "@/lib/form-validation";

const TAG_OPTIONS = [
  { value: "", label: "ไม่มีป้าย" },
  { value: "ใหม่", label: "ใหม่" },
  { value: "ขายดี", label: "ขายดี" },
  { value: "ลดราคา", label: "ลดราคา" },
  { value: "ตำหนิ", label: "ตำหนิ (สินค้ามีตำหนิ/นอก SKU ปกติ)" },
] as const;

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export type VariantInput = {
  id?: string;
  colorName: string;
  images: string[];
  stockQuantity: number;
};

export type ProductFormValues = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  tag: string;
  description: string;
  bust: number;
  length: number;
  shoulder: number;
  videoUrl: string;
  coverImage: string | null;
  isPublished: boolean;
  variants: VariantInput[];
};

const EMPTY_VALUES: ProductFormValues = {
  id: "",
  slug: "",
  name: "",
  price: 0,
  compareAtPrice: null,
  tag: "",
  description: "",
  bust: 0,
  length: 0,
  shoulder: 0,
  videoUrl: "",
  coverImage: null,
  isPublished: true,
  variants: [],
};

export default function ProductForm({
  initialValues,
}: {
  initialValues?: ProductFormValues;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialValues);
  const [values, setValues] = useState<ProductFormValues>(initialValues ?? EMPTY_VALUES);
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleNameChange(name: string) {
    setValues((v) => ({ ...v, name, slug: slugTouched ? v.slug : slugify(name) }));
  }

  function addVariant() {
    update("variants", [...values.variants, { colorName: "", images: [], stockQuantity: 0 }]);
  }

  function updateVariant(index: number, patch: Partial<VariantInput>) {
    update(
      "variants",
      values.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    );
  }

  async function removeVariant(index: number) {
    const variant = values.variants[index];
    setError(null);

    if (!variant.id) {
      // Never saved to the DB — just drop it locally, no API call needed.
      update(
        "variants",
        values.variants.filter((_, i) => i !== index),
      );
      return;
    }

    if (!confirm(`ลบสี "${variant.colorName}" ถาวร?`)) return;

    const res = await fetch(`/api/admin/products/${values.id}/variants/${variant.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "ลบสีไม่สำเร็จ");
      return;
    }

    update(
      "variants",
      values.variants.filter((_, i) => i !== index),
    );
  }

  async function handleDeleteProduct() {
    if (!confirm(`ลบสินค้า "${values.name}" ถาวร? ไม่สามารถย้อนกลับได้`)) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${values.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ลบสินค้าไม่สำเร็จ");
        return;
      }
      router.push("/admin/products");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (values.variants.length === 0) {
      setError("กรุณาเพิ่มสีอย่างน้อย 1 สี");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        slug: values.slug,
        name: values.name,
        price: values.price,
        compareAtPrice: values.compareAtPrice,
        tag: values.tag || null,
        description: values.description,
        measurements: { bust: values.bust, length: values.length, shoulder: values.shoulder },
        videoUrl: values.videoUrl || null,
        coverImage: values.coverImage,
        isPublished: values.isPublished,
        variants: values.variants,
      };

      const res = await fetch(
        isEditing ? `/api/admin/products/${values.id}` : "/api/admin/products",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "บันทึกไม่สำเร็จ");
        return;
      }

      if (isEditing) {
        setSuccess(true);
        router.refresh();
      } else {
        router.push(`/admin/products/${data.slug}/edit`);
      }
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <div>
          <label className="text-sm font-medium text-shop-text" htmlFor="name">
            ชื่อสินค้า
          </label>
          <input
            id="name"
            required
            value={values.name}
            onChange={(e) => handleNameChange(e.target.value)}
            onInvalid={thaiInvalidMessage}
            onInput={clearCustomValidity}
            className={fieldClass}
          />
        </div>

        <div className="mt-3">
          <label className="text-sm font-medium text-shop-text" htmlFor="slug">
            Slug (URL) — ปกติไม่ต้องแก้เอง
          </label>
          <input
            id="slug"
            required
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", e.target.value);
            }}
            onInvalid={thaiInvalidMessage}
            onInput={clearCustomValidity}
            className={fieldClass}
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-shop-text" htmlFor="price">
              ราคา (บาท)
            </label>
            <input
              id="price"
              type="number"
              min={0}
              step="0.01"
              required
              value={values.price}
              onChange={(e) => update("price", Number(e.target.value))}
              onInvalid={thaiInvalidMessage}
              onInput={clearCustomValidity}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-shop-text" htmlFor="compare_at_price">
              ราคาเดิม (ไม่บังคับ — ใส่เมื่อลดราคา)
            </label>
            <input
              id="compare_at_price"
              type="number"
              min={0}
              step="0.01"
              value={values.compareAtPrice ?? ""}
              onChange={(e) =>
                update("compareAtPrice", e.target.value === "" ? null : Number(e.target.value))
              }
              className={fieldClass}
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="text-sm font-medium text-shop-text" htmlFor="tag">
            ป้ายสินค้า
          </label>
          <select
            id="tag"
            value={values.tag}
            onChange={(e) => update("tag", e.target.value)}
            className={fieldClass}
          >
            {TAG_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3">
          <label className="text-sm font-medium text-shop-text" htmlFor="description">
            รายละเอียดสินค้า
          </label>
          <textarea
            id="description"
            rows={3}
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="mt-3">
          <p className="text-sm font-medium text-shop-text">ขนาด (นิ้ว)</p>
          <div className="mt-1.5 grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-shop-text-soft" htmlFor="bust">
                รอบอก
              </label>
              <input
                id="bust"
                type="number"
                min={0}
                value={values.bust}
                onChange={(e) => update("bust", Number(e.target.value))}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-xs text-shop-text-soft" htmlFor="length">
                ความยาว
              </label>
              <input
                id="length"
                type="number"
                min={0}
                value={values.length}
                onChange={(e) => update("length", Number(e.target.value))}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-xs text-shop-text-soft" htmlFor="shoulder">
                ไหล่
              </label>
              <input
                id="shoulder"
                type="number"
                min={0}
                value={values.shoulder}
                onChange={(e) => update("shoulder", Number(e.target.value))}
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        <div className="mt-3">
          <label className="text-sm font-medium text-shop-text" htmlFor="video_url">
            ลิงก์วิดีโอ (ไม่บังคับ)
          </label>
          <input
            id="video_url"
            value={values.videoUrl}
            onChange={(e) => update("videoUrl", e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="mt-3">
          <p className="text-sm font-medium text-shop-text">
            รูปปกรวมทุกสี (ไม่บังคับ)
          </p>
          <div className="mt-1.5">
            <ImageUploader
              images={values.coverImage ? [values.coverImage] : []}
              onChange={(images) => update("coverImage", images[0] ?? null)}
            />
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-shop-text">
          <input
            type="checkbox"
            checked={values.isPublished}
            onChange={(e) => update("isPublished", e.target.checked)}
          />
          เผยแพร่ (แสดงบนหน้าร้าน)
        </label>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <div className="flex items-center justify-between">
          <p className="font-medium text-shop-text">สี / ตัวเลือกสินค้า</p>
          <button
            type="button"
            onClick={addVariant}
            className="rounded-full border border-shop-blush-200 px-4 py-1.5 text-sm font-medium text-shop-text hover:bg-shop-blush-50"
          >
            + เพิ่มสี
          </button>
        </div>

        {values.variants.length === 0 && (
          <p className="mt-3 text-sm text-shop-text-soft">ยังไม่มีสี — กด &quot;+ เพิ่มสี&quot;</p>
        )}

        <div className="mt-3 space-y-4">
          {values.variants.map((variant, i) => (
            <div key={i} className="rounded-xl border border-shop-blush-100 p-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  ลบสีนี้
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-shop-text-soft">ชื่อสี</label>
                  <input
                    required
                    value={variant.colorName}
                    onChange={(e) => updateVariant(i, { colorName: e.target.value })}
                    onInvalid={thaiInvalidMessage}
                    onInput={clearCustomValidity}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-shop-text-soft">สต็อก</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={variant.stockQuantity}
                    onChange={(e) => updateVariant(i, { stockQuantity: Number(e.target.value) })}
                    onInvalid={thaiInvalidMessage}
                    onInput={clearCustomValidity}
                    className={fieldClass}
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="text-xs text-shop-text-soft">รูปสีนี้</label>
                <div className="mt-1.5">
                  <ImageUploader
                    images={variant.images}
                    onChange={(images) => updateVariant(i, { images })}
                    multiple
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">บันทึกสำเร็จ</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-shop-blush-500 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "กำลังบันทึก..." : isEditing ? "บันทึกการแก้ไข" : "สร้างสินค้า"}
      </button>

      {isEditing && (
        <button
          type="button"
          onClick={handleDeleteProduct}
          disabled={submitting}
          className="w-full rounded-full border border-red-200 px-8 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          ลบสินค้านี้ถาวร
        </button>
      )}
    </form>
  );
}
