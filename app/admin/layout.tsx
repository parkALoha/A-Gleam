import { Suspense } from "react";
import type { Metadata } from "next";
import { getAdminUser } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import PageLoading from "@/components/PageLoading";

// A static file, not the special app/manifest.ts convention — that one only
// works at the app root, and this needs to apply to /admin alone so
// customers browsing the shop never get an "install app" prompt for it.
export const metadata: Metadata = {
  manifest: "/admin-manifest.webmanifest",
};

async function AdminShell({ children }: { children: React.ReactNode }) {
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getAdminUser() re-validates against the auth server every render (it
  // has to — this is the real access gate) which is a network round trip.
  // A layout's own await isn't covered by the page's loading.tsx (loading.tsx
  // only wraps page.js and layouts nested below it), so without its own
  // Suspense boundary here, first entry into /admin just sits blank/frozen
  // for that round trip instead of showing a spinner.
  return (
    <Suspense fallback={<PageLoading />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
