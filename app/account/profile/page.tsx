import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";
import AccountLogoutButton from "@/components/AccountLogoutButton";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, phone, address_line, subdistrict, district, province, postal_code",
    )
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-shop-text">
          ข้อมูลส่วนตัว
        </h1>
        <AccountLogoutButton />
      </div>

      <ProfileForm
        showWelcome={welcome === "1"}
        initialValues={{
          full_name: profile?.full_name ?? "",
          phone: profile?.phone ?? "",
          address_line: profile?.address_line ?? "",
          subdistrict: profile?.subdistrict ?? "",
          district: profile?.district ?? "",
          province: profile?.province ?? "",
          postal_code: profile?.postal_code ?? "",
        }}
      />
    </div>
  );
}
