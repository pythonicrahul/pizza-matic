"use client";

import { useState } from "react";
import Link from "next/link";

interface Addr {
  id: string;
  label: string | null;
  address: string | null;
  lat: number;
  lng: number;
}

export function AccountPanel({
  name,
  phone,
  initialAddresses,
}: {
  name: string | null;
  phone: string;
  initialAddresses: Addr[];
}) {
  const [addresses, setAddresses] = useState<Addr[]>(initialAddresses);
  const [busy, setBusy] = useState(false);

  async function removeAddr(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/addresses?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  }

  async function signOut() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.assign("/");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-lg font-black text-white shadow-warm-sm">
          {(name || "G").charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="text-xl font-extrabold">{name || "Guest"}</h1>
          <p className="text-sm text-muted">{phone}</p>
        </div>
      </div>

      <Link
        href="/orders"
        className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 shadow-warm-sm hover:border-brand/40"
      >
        <span className="font-semibold">🧾 My orders</span>
        <span className="text-brand">→</span>
      </Link>

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-warm-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Saved addresses</h2>
        {addresses.length === 0 ? (
          <p className="text-sm text-muted">No saved addresses yet — they&apos;re saved automatically at checkout.</p>
        ) : (
          <div className="space-y-2">
            {addresses.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{a.label || "Saved address"}</p>
                  {a.address && <p className="truncate text-xs text-muted">{a.address}</p>}
                </div>
                <button onClick={() => removeAddr(a.id)} className="shrink-0 text-xs text-red-500 hover:underline">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        onClick={signOut}
        disabled={busy}
        className="w-full rounded-2xl border border-border bg-surface p-4 text-center font-semibold text-red-500 shadow-warm-sm hover:border-red-200 disabled:opacity-50"
      >
        {busy ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
