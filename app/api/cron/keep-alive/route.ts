import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Supabase's free tier pauses a project after 7 days with no database
// activity — a real risk for a low-order-volume shop. Vercel Cron hits this
// once a day (see vercel.json) to run one trivial query, which is enough
// activity to keep resetting that 7-day clock indefinitely.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("shop_settings").select("id").limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, checkedAt: new Date().toISOString() });
}
