export default function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center py-20">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-shop-blush-100 border-t-shop-blush-500"
        role="status"
        aria-label="กำลังโหลด"
      />
    </div>
  );
}
