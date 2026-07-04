import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { validatePhone } from "@/lib/validators";

// Onboard a delivery rider: create the auth user (service role) + a rider profile.
export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const fullName = String(body?.fullName ?? "").trim();
  const phone = validatePhone(body?.phone);

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (fullName.length < 2) {
    return NextResponse.json({ ok: false, error: "Rider name is required." }, { status: 400 });
  }
  if (!phone.ok) return NextResponse.json({ ok: false, error: phone.error }, { status: 400 });

  const svc = createAdminClient();
  const { data: created, error } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !created?.user) {
    return NextResponse.json({ ok: false, error: error?.message ?? "Could not create rider." }, { status: 400 });
  }

  const { error: pErr } = await svc
    .from("profiles")
    .insert({ id: created.user.id, role: "rider", full_name: fullName, phone: phone.value, is_online: false });
  if (pErr) {
    // roll back the orphaned auth user so the email can be reused
    await svc.auth.admin.deleteUser(created.user.id).catch(() => {});
    return NextResponse.json({ ok: false, error: "Could not save rider profile." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, rider: { id: created.user.id, email, full_name: fullName } });
}
