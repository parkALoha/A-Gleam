import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/set-admin.mjs <email>");
  process.exit(1);
}

const { data: usersPage, error: listError } =
  await supabase.auth.admin.listUsers();

if (listError) {
  console.error("ดึงรายชื่อผู้ใช้ไม่สำเร็จ:", listError.message);
  process.exit(1);
}

const user = usersPage.users.find((u) => u.email === email);
if (!user) {
  console.error(`ไม่พบบัญชีอีเมล ${email} — สร้างผ่าน Supabase Dashboard ก่อน`);
  process.exit(1);
}

const { error: upsertError } = await supabase
  .from("profiles")
  .upsert({ id: user.id, is_admin: true }, { onConflict: "id" });

if (upsertError) {
  console.error("ตั้งค่า is_admin ไม่สำเร็จ:", upsertError.message);
  process.exit(1);
}

console.log(`ตั้งค่า ${email} เป็นแอดมินสำเร็จ`);
