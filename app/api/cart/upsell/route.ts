import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data/settings";
import { createAdminClient } from "@/lib/supabase/admin";

interface LineIn {
  pizzaId: string;
  toppingIds: string[];
}

// Topping suggestions per cart line, driven by the cart_topping_suggestions
// engine (pizza affinity + popularity). Skips lines already at the topping cap.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const lines = body?.lines as LineIn[] | undefined;
  if (!Array.isArray(lines)) return NextResponse.json({ perLine: [] });

  const settings = await getSettings();
  const supabase = createAdminClient();

  const perLine = await Promise.all(
    lines.map(async (line) => {
      const current = Array.isArray(line.toppingIds) ? line.toppingIds : [];
      const remaining = settings.max_toppings - current.length;
      if (!line.pizzaId || remaining <= 0) return { suggestions: [] };

      const { data, error } = await supabase.rpc("cart_topping_suggestions", {
        p_pizza_id: line.pizzaId,
        p_exclude: current,
        p_limit: Math.min(3, remaining),
      });
      if (error) return { suggestions: [] };
      return { suggestions: data ?? [] };
    }),
  );

  return NextResponse.json({ perLine });
}
