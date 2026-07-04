import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth/admin";
import { markOrderReady } from "@/lib/data/admin";

// Mark an order ready (kitchen "done"). Admin-only.
export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const orderCode = String(body?.orderCode ?? "");
  const ok = await markOrderReady(orderCode);

  // A newly-ready order is dispatchable — try to assign it to a free rider.
  if (ok) await admin.supabase.rpc("dispatch_deliveries");

  return NextResponse.json({ ok });
}
