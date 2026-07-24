import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-shop-cream px-5 text-center">
      <p className="text-sm font-medium tracking-wide text-shop-blush-500">A GLEAM</p>
      <h1 className="mt-2 text-2xl font-semibold text-shop-text">ไม่พบหน้านี้</h1>
      <p className="mt-2 text-sm text-shop-text-soft">
        ลิงก์อาจผิดพลาด หรือหน้านี้ถูกย้ายไปแล้ว
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-shop-blush-500 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105"
      >
        กลับหน้าแรก
      </Link>
    </div>
  );
}
