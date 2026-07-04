"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { VegDot } from "@/components/veg-dot";
import { formatRupees } from "@/lib/money";

interface Suggestion {
  topping_id: string;
  name: string;
  price_paise: number;
  is_veg: boolean | null;
  affinity: number;
  pizza_total: number;
  popularity: number;
}

function tag(s: Suggestion): string {
  if (s.affinity > 0 && s.pizza_total > 0) {
    const pct = Math.round((100 * s.affinity) / s.pizza_total);
    return `🔥 added to ${pct}% of these`;
  }
  if (s.popularity > 0) return "⭐ Popular";
  return "👨‍🍳 Chef's pick";
}

export function CartUpsell() {
  const { lines, addToppingToLine } = useCart();
  const [perLine, setPerLine] = useState<{ suggestions: Suggestion[] }[]>([]);

  useEffect(() => {
    if (lines.length === 0) {
      setPerLine([]);
      return;
    }
    const payload = lines.map((l) => ({ pizzaId: l.pizza.id, toppingIds: l.toppings.map((t) => t.id) }));
    let cancelled = false;
    fetch("/api/cart/upsell", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lines: payload }),
    })
      .then((r) => r.json())
      .then((d) => !cancelled && setPerLine(d.perLine ?? []))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lines]);

  const hasAny = perLine.some((pl) => pl.suggestions?.length);
  if (!hasAny) return null;

  return (
    <section className="mt-5 rounded-2xl border border-brand/30 bg-orange-50 p-4">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-extrabold text-brand">
        ✨ Make it even better
      </h2>
      <div className="space-y-4">
        {lines.map((line, i) => {
          const sugg = perLine[i]?.suggestions ?? [];
          if (!sugg.length) return null;
          return (
            <div key={line.key}>
              <p className="mb-2 text-xs font-medium text-muted">
                Pairs great with <span className="font-semibold text-foreground">{line.pizza.name}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {sugg.map((s) => (
                  <button
                    key={s.topping_id}
                    onClick={() =>
                      addToppingToLine(line.key, {
                        id: s.topping_id,
                        name: s.name,
                        price_paise: s.price_paise,
                        is_veg: s.is_veg,
                      })
                    }
                    className="group flex items-center gap-2 rounded-full border border-brand bg-surface px-3 py-2 text-left text-sm shadow-sm transition hover:bg-brand hover:text-white"
                  >
                    <span className="flex items-center gap-1.5 font-semibold">
                      <VegDot isVeg={s.is_veg} />
                      + {s.name}
                    </span>
                    <span className="text-xs opacity-80">{formatRupees(s.price_paise)}</span>
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand group-hover:bg-white/20 group-hover:text-white">
                      {tag(s)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
