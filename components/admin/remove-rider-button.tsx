"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RemoveRiderButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function remove() {
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/admin/riders?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({ ok: false }));
    setBusy(false);
    if (!data.ok) {
      setErr(data.error || "Failed");
      setConfirming(false);
      return;
    }
    router.refresh();
  }

  if (err) return <span className="text-xs text-red-500">{err}</span>;

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-sm text-red-500 hover:underline">
        Remove
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <button onClick={remove} disabled={busy} className="font-semibold text-red-600 hover:underline disabled:opacity-50">
        {busy ? "Removing…" : "Confirm"}
      </button>
      <button onClick={() => setConfirming(false)} className="text-muted hover:underline">
        Cancel
      </button>
    </span>
  );
}
