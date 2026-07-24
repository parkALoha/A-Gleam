import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  await getAdminSession();

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <Link href="/admin/products" className="text-sm text-shop-text-soft hover:text-shop-blush-600">
        ← กลับไปหน้ารายการสินค้า
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-shop-text">เพิ่มสินค้าใหม่</h1>

      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
