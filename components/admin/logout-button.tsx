"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function LogoutButton({ redirectTo = "/admin/login" }: { redirectTo?: string }) {
  const router = useRouter();
  async function logout() {
    await createClient().auth.signOut();
    router.push(redirectTo);
    router.refresh();
  }
  return (
    <button onClick={logout} className="text-sm text-muted hover:text-foreground hover:underline">
      Sign out
    </button>
  );
}
