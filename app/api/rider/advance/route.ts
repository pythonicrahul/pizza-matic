import { NextResponse } from "next/server";
import { getRider } from "@/lib/auth/rider";

// Advance the rider's active delivery: 'pickup' → out_for_delivery, 'deliver' →
// delivered (which auto-dispatches the rider's next job). The RPC only ever
// touches the caller's own delivery.
export async function POST(req: Request) {
  const rider = await getRider();
  if (!rider) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = String(body?.action ?? "");
  if (action !== "pickup" && action !== "deliver") {
    return NextResponse.json({ ok: false, error: "Invalid action." }, { status: 400 });
  }

  const { data, error } = await rider.supabase.rpc("rider_advance_delivery", { p_action: action });
  if (error) {
    console.error("rider_advance_delivery failed", error);
    return NextResponse.json({ ok: false, error: "Could not update delivery." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, status: data });
}
