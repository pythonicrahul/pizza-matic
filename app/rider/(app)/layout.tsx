import { requireRider } from "@/lib/auth/rider";
import { LogoutButton } from "@/components/admin/logout-button";

export default async function RiderLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRider();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <span className="font-extrabold text-brand">🛵 SliceMatic Rider</span>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted sm:inline">{profile.full_name ?? "Rider"}</span>
            <LogoutButton redirectTo="/rider/login" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-6">{children}</main>
    </div>
  );
}
