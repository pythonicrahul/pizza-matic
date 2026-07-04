import { getRiders, getDeliveryQueue } from "@/lib/data/delivery";
import { formatRupees } from "@/lib/money";
import { RiderOnboardForm } from "@/components/admin/rider-onboard-form";
import { RemoveRiderButton } from "@/components/admin/remove-rider-button";

export const dynamic = "force-dynamic";

function riderStatus(r: { is_online: boolean; current: unknown }): { label: string; cls: string } {
  if (r.current) return { label: "On delivery", cls: "bg-orange-50 text-brand" };
  if (r.is_online) return { label: "Available", cls: "bg-green-50 text-green-700" };
  return { label: "Offline", cls: "bg-stone-100 text-muted" };
}

export default async function DeliveriesPage() {
  const [riders, queue] = await Promise.all([getRiders(), getDeliveryQueue()]);

  const queued = queue.filter((q) => q.status === "unassigned");
  const inFlight = queue.filter((q) => q.status !== "unassigned");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Delivery</h1>

      <RiderOnboardForm />

      {/* Riders */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Rider</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Current order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {riders.map((r) => {
              const s = riderStatus(r);
              return (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{r.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{r.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.current ? `#${String(r.current.token).padStart(2, "0")} · ${r.current.status.replace(/_/g, " ")}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RemoveRiderButton id={r.id} />
                  </td>
                </tr>
              );
            })}
            {riders.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-muted">No riders yet — onboard one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Queue */}
      <div>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
          Queued — waiting for a rider ({queued.length})
        </h2>
        <QueueTable rows={queued} showRider={false} />
      </div>

      <div>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
          On the road ({inFlight.length})
        </h2>
        <QueueTable rows={inFlight} showRider />
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function QueueTable({ rows, showRider }: { rows: any[]; showRider: boolean }) {
  if (rows.length === 0) return <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">None.</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="border-b border-border text-left text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Token</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Distance</th>
            {showRider && <th className="px-4 py-3">Rider</th>}
            <th className="px-4 py-3">State</th>
            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((q) => (
            <tr key={q.id} className="border-b border-border/60 last:border-0">
              <td className="px-4 py-3 font-semibold">#{String(q.order?.token).padStart(2, "0")}</td>
              <td className="px-4 py-3">{q.order?.name || "—"}</td>
              <td className="px-4 py-3 text-muted">{q.distance_km} km</td>
              {showRider && <td className="px-4 py-3">{q.rider?.full_name ?? "—"}</td>}
              <td className="px-4 py-3 capitalize">{q.status === "unassigned" ? (q.order?.status === "ready" ? "ready · queued" : "awaiting kitchen") : q.status.replace(/_/g, " ")}</td>
              <td className="px-4 py-3 text-right font-medium">{formatRupees(q.order?.total_paise ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
