import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";
import AccountLogoutButton from "@/components/AccountLogoutButton";
import AvatarUpload from "@/components/AvatarUpload";

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
      "full_name, phone, address_line, subdistrict, district, province, postal_code, avatar_url",
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

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-shop-blush-100">
        <AvatarUpload
          userId={user.id}
          initialAvatarUrl={profile?.avatar_url ?? null}
          fallbackLabel={profile?.full_name || user.email || "?"}
        />
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
