import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { Webhook, WebhookVerificationError } from "standardwebhooks";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "A GLEAM <onboarding@resend.dev>";

// Supabase gives the secret as "v1,whsec_xxx" — the Webhook constructor only
// wants the part after "v1,".
const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET?.replace("v1,", "");

interface SendEmailPayload {
  user: { email: string };
  email_data: {
    token: string;
    email_action_type: string;
  };
}

export async function POST(request: NextRequest) {
  if (!hookSecret) {
    return NextResponse.json({ error: "hook not configured" }, { status: 500 });
  }

  const payload = await request.text();
  const headers = Object.fromEntries(request.headers);

  let data: SendEmailPayload;
  try {
    data = new Webhook(hookSecret).verify(payload, headers) as SendEmailPayload;
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
    throw error;
  }

  const { user, email_data } = data;

  // Only the "ลืมรหัสผ่าน" flow sends email today — signup doesn't require
  // confirmation, and there's no magic-link login or email-change UI yet.
  if (email_data.email_action_type !== "recovery") {
    return NextResponse.json(
      { error: `unsupported email_action_type: ${email_data.email_action_type}` },
      { status: 400 },
    );
  }

  if (!resend) {
    return NextResponse.json({ error: "email service not configured" }, { status: 500 });
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: user.email,
    subject: "รหัสรีเซ็ตรหัสผ่าน A GLEAM",
    html: `
      <h2>รีเซ็ตรหัสผ่าน</h2>
      <p>รหัสยืนยันสำหรับตั้งรหัสผ่านใหม่ของคุณคือ:</p>
      <h1 style="letter-spacing: 4px;">${email_data.token}</h1>
      <p>กรอกรหัสนี้ในหน้าเว็บเพื่อตั้งรหัสผ่านใหม่ (รหัสจะหมดอายุใน 1 ชั่วโมง)</p>
    `,
  });

  return NextResponse.json({});
}
