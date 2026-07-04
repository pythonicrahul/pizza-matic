import "server-only";

import { createClient } from "@/lib/supabase/server";

const ACTIVE = ["assigned", "picked_up", "out_for_delivery"] as const;

export interface RiderRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_online: boolean;
  created_at: string;
  current: { order_code: string; token: number; status: string } | null;
}

/** Admin: all riders with derived availability + their current delivery (if any). */
export async function getRiders(): Promise<RiderRow[]> {
  const supabase = await createClient();

  const { data: riders } = await supabase
    .from("profiles")
    .select("id, full_name, phone, is_online, created_at")
    .eq("role", "rider")
    .order("created_at", { ascending: true });

  const { data: active } = await supabase
    .from("deliveries")
    .select("rider_id, status, order:order_id(order_code, token)")
    .in("status", ACTIVE as unknown as string[]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const byRider = new Map<string, any>();
  for (const d of (active ?? []) as any[]) {
    if (d.rider_id) byRider.set(d.rider_id, { order_code: d.order?.order_code, token: d.order?.token, status: d.status });
  }

  return ((riders ?? []) as any[]).map((r) => ({
    id: r.id,
    full_name: r.full_name,
    phone: r.phone,
    is_online: r.is_online,
    created_at: r.created_at,
    current: byRider.get(r.id) ?? null,
  }));
}

export interface QueueRow {
  id: string;
  status: string;
  distance_km: number;
  dropoff_address: string | null;
  assigned_at: string | null;
  rider: { full_name: string | null } | null;
  order: { order_code: string; token: number; status: string; name: string | null; total_paise: number; placed_at: string } | null;
}

/** Admin: all in-flight deliveries (queued + assigned + on the road). */
export async function getDeliveryQueue(): Promise<QueueRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deliveries")
    .select(
      "id, status, distance_km, dropoff_address, assigned_at, rider:rider_id(full_name), " +
        "order:order_id(order_code, token, status, name, total_paise, placed_at)",
    )
    .in("status", ["unassigned", "assigned", "picked_up", "out_for_delivery"])
    .order("assigned_at", { ascending: true, nullsFirst: true });
  return (data ?? []) as unknown as QueueRow[];
}

export interface RiderCurrent {
  id: string;
  status: string;
  distance_km: number;
  dropoff_lat: number;
  dropoff_lng: number;
  dropoff_address: string | null;
  order: {
    order_code: string;
    token: number;
    name: string | null;
    phone: string;
    total_paise: number;
    payment_mode: string;
    payment_status: string;
    order_items: { qty: number; pizza: { name: string } | null; base: { name: string } | null }[];
  } | null;
}

/** Rider: their single active delivery (or null). Uses the rider's own session (RLS). */
export async function getRiderCurrent(): Promise<RiderCurrent | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deliveries")
    .select(
      "id, status, distance_km, dropoff_lat, dropoff_lng, dropoff_address, " +
        "order:order_id(order_code, token, name, phone, total_paise, payment_mode, payment_status, " +
        "order_items(qty, pizza:pizza_id(name), base:base_id(name)))",
    )
    .in("status", ACTIVE as unknown as string[])
    .order("assigned_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data ?? null) as unknown as RiderCurrent | null;
}
