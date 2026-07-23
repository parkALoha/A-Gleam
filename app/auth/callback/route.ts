import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const orderNumber = searchParams.get("orderNumber");
  const phone = searchParams.get("phone");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      // Signed up via social login right after checkout — link that order
      // (and seed the profile from it) the same way the email/password
      // post-checkout signup does, then send them back to the confirmation.
      if (orderNumber && phone) {
        const service = createServiceClient();
        const { data: order } = await service
          .from("orders")
          .select(
            "id, customer_phone, customer_id, customer_name, address_line, subdistrict, district, province, postal_code",
          )
          .eq("order_number", orderNumber)
          .maybeSingle();

        if (order && !order.customer_id && order.customer_phone === phone) {
          await service
            .from("orders")
            .update({ customer_id: data.user.id })
            .eq("id", order.id);
          await service
            .from("profiles")
            .update({
              phone: order.customer_phone,
              full_name: order.customer_name,
              address_line: order.address_line,
              subdistrict: order.subdistrict,
              district: order.district,
              province: order.province,
              postal_code: order.postal_code,
            })
            .eq("id", data.user.id);
        }

        return NextResponse.redirect(
          `${origin}/checkout/confirmation/${orderNumber}`,
        );
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", data.user.id)
        .maybeSingle();

      // First time in from a social login with no phone on file yet — ask
      // for it once so we can find/link any past guest orders by phone.
      if (!profile?.phone) {
        return NextResponse.redirect(`${origin}/account/profile?welcome=1`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/account/orders`);
}
