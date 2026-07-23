import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const schema = z.object({
  full_name: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address_line: z.string().trim().optional(),
  subdistrict: z.string().trim().optional(),
  district: z.string().trim().optional(),
  province: z.string().trim().optional(),
  postal_code: z.string().trim().optional(),
});

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();

  const { error: updateError } = await supabase
    .from("profiles")
    .update(body.data)
    .eq("id", user.id);

  if (updateError) {
    if (updateError.code === "23505") {
      return NextResponse.json(
        { error: "เบอร์โทรนี้ถูกใช้กับบัญชีอื่นแล้ว" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "บันทึกไม่สำเร็จ" }, { status: 500 });
  }

  // Phone just set for the first time (or changed) — sweep for past guest
  // orders placed with this phone and link them to the account now.
  const newPhone = body.data.phone;
  if (newPhone && newPhone !== existing?.phone) {
    const service = createServiceClient();
    await service
      .from("orders")
      .update({ customer_id: user.id })
      .eq("customer_phone", newPhone)
      .is("customer_id", null);
  }

  return NextResponse.json({ success: true });
}
