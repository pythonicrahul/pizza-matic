import { NextResponse } from "next/server";
import { validatePhone } from "@/lib/validators";
import { getCustomerByPhone } from "@/lib/data/customers";

// "Send" an OTP. In mock mode (OTP_MOCK != "false") no SMS is sent — the client
// just enters the fixed dev code. In production this would call an SMS provider.
// `existing` tells the client whether this is a sign-in or a sign-up.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const phone = validatePhone(body?.phone);
  if (!phone.ok) return NextResponse.json({ ok: false, error: phone.error }, { status: 400 });

  const existing = Boolean(await getCustomerByPhone(phone.value));
  const mock = process.env.OTP_MOCK !== "false";
  if (mock) {
    return NextResponse.json({
      ok: true,
      mock: true,
      existing,
      hint: `Demo mode — enter code ${process.env.OTP_DEV_CODE ?? "123456"}`,
    });
  }

  // Real provider integration would go here.
  return NextResponse.json(
    { ok: false, error: "SMS provider not configured." },
    { status: 501 },
  );
}
