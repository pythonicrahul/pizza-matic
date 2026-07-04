import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Returns the logged-in rider (user + profile + client), or null if not a rider. */
export async function getRider() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, phone, is_online")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "rider") return null;
  return { user, profile, supabase };
}

/** For protected rider pages: redirect to the rider login if not a rider. */
export async function requireRider() {
  const rider = await getRider();
  if (!rider) redirect("/rider/login");
  return rider;
}
