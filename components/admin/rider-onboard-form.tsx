"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RiderOnboardForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/riders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, fullName, phone }),
    });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) {
      setMsg({ ok: false, text: data.error });
      return;
    }
    setMsg({ ok: true, text: `Rider ${fullName} onboarded.` });
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <h2 className="mb-3 font-semibold">Onboard a rider</h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="rounded-lg border border-border px-3 py-2 text-sm" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (10 digits)" inputMode="numeric" className="rounded-lg border border-border px-3 py-2 text-sm" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Login email" type="email" className="rounded-lg border border-border px-3 py-2 text-sm" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 8)" type="text" className="rounded-lg border border-border px-3 py-2 text-sm" />
      </div>
      <button
        onClick={submit}
        disabled={busy}
        className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {busy ? "Onboarding…" : "Add rider"}
      </button>
      {msg && (
        <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>
      )}
    </div>
  );
}
