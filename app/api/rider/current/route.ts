import { NextResponse } from "next/server";
import { getRider } from "@/lib/auth/rider";
import { getRiderCurrent } from "@/lib/data/delivery";

// Poll target for the rider console: current assignment + online state.
export async function GET() {
  const rider = await getRider();
  if (!rider) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const current = await getRiderCurrent();
  return NextResponse.json({ current, online: rider.profile.is_online });
}
