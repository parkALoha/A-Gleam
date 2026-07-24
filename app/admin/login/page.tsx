import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import AdminLoginForm from "@/components/AdminLoginForm";

export default async function AdminLoginPage() {
  const admin = await getAdminUser();
  if (admin) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <AdminLoginForm />
    </div>
  );
}
