"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  // Already signed in as an admin? Go straight to the dashboard (also self-heals
  // a stuck login page after a redirect race). Role-checked to avoid a loop.
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle();
        if (profile?.role === "admin") {
          window.location.replace("/admin");
          return;
        }
      }
      setChecking(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login() {
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    // Hard navigation guarantees the fresh auth cookie reaches the server —
    // avoids the client-nav-vs-cookie race that could leave you on this page.
    window.location.assign("/admin");
  }

  if (checking) return null;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-extrabold">SliceMatic Admin</h1>
      <p className="mb-6 text-sm text-muted">Sign in to manage orders & kitchen.</p>
      <div className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3"
        />
        <button
          onClick={login}
          disabled={busy}
          className="w-full rounded-xl bg-brand px-4 py-3 font-bold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
}
