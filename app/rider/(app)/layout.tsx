import { requireRider } from "@/lib/auth/rider";
import { RiderTabBar } from "@/components/rider-tab-bar";

export default async function RiderLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRider();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <span className="font-extrabold text-brand">🛵 SliceMatic Rider</span>
          <span className="text-sm text-muted">{profile.full_name ?? "Rider"}</span>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-6 pb-28">{children}</main>
      <RiderTabBar />
    </div>
  );
}
