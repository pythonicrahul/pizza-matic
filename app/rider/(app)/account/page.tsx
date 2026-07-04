import { requireRider } from "@/lib/auth/rider";
import { LogoutButton } from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";

export default async function RiderAccountPage() {
  const { profile } = await requireRider();
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-lg font-black text-white shadow-warm-sm">
          {(profile.full_name || "R").charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="text-xl font-extrabold">{profile.full_name || "Rider"}</h1>
          <p className="text-sm text-muted">{profile.phone ?? "Rider account"}</p>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 shadow-warm-sm">
        <span className="text-sm text-muted">Signed in as a rider</span>
        <LogoutButton redirectTo="/rider/login" />
      </div>
    </div>
  );
}
