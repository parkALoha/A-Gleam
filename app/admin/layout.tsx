import { getAdminUser } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  // Not an admin session (e.g. sitting on /admin/login) — no sidebar/nav to
  // leak, just the bare page on a plain background.
  if (!admin) {
    return <div className="min-h-screen flex-1 bg-shop-cream">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-shop-cream md:flex-row">
      <AdminSidebar adminEmail={admin.email ?? ""} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
