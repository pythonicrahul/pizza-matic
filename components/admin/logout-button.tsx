"use client";

import { createClient } from "@/lib/supabase/browser";

export function LogoutButton({ redirectTo = "/admin/login" }: { redirectTo?: string }) {
  async function logout() {
    await createClient().auth.signOut();
    // Hard navigation so the cleared session is reflected server-side immediately.
    window.location.assign(redirectTo);
  }
  return (
    <button onClick={logout} className="rounded-lg px-2 py-1 text-sm text-muted transition-colors hover:bg-background hover:text-foreground">
      Sign out
    </button>
  );
}
