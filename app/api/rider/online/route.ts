import { NextResponse } from "next/server";
import { getRider } from "@/lib/auth/rider";

// Rider toggles availability. Going online also triggers dispatch (inside the RPC).
export async function POST(req: Request) {
  const rider = await getRider();
  if (!rider) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const online = Boolean(body?.online);

  const { error } = await rider.supabase.rpc("rider_set_online", { p_online: online });
  if (error) {
    console.error("rider_set_online failed", error);
    return NextResponse.json({ ok: false, error: "Could not update status." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, online });
}
