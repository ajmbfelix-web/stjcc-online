import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { OwnerFrame, ownerHeaders } from "@/components/owner-frame";
import { Badge } from "@/components/ui/badge";
import { SignInGate } from "@/lib/auth/gates";
import { catalogItem } from "@/lib/billing/catalog";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/owner/clients/$onboardingId/drivers/$rosterId")({
  head: () => ({ meta: [{ title: pageTitle("Driver") }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <SignInGate><DriverPage /></SignInGate>,
});

type DriverFile = {
  driver: { id: string; name: string; cdl: string; hiredOn: string | null; needsTesting: boolean; inRandomPool: boolean; employmentStatus: string };
  orders: Array<{ id: string; sku: string; status: string; reason: string; clearinghouse: string; clearinghouseActorUserId: string | null; clearinghouseDecidedAt: string | null; createdAt: string }>;
  selections: Array<{ id: string; testKind: string; period: string }>;
  timeline: Array<{ at: string; kind: string; title: string; detail: string }>;
};

function DriverPage() {
  const { onboardingId, rosterId } = Route.useParams();
  const [file, setFile] = useState<DriverFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch(`/api/owner/accounts/${onboardingId}/drivers/${rosterId}`, { headers: ownerHeaders(), credentials: "include" })
      .then(async (response) => {
        const json = (await response.json()) as DriverFile & { error?: string };
        if (!response.ok) throw new Error(json.error ?? "Driver unavailable");
        setFile(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Driver unavailable"));
  }, [onboardingId, rosterId]);

  const driver = file?.driver;
  return (
    <OwnerFrame title={driver?.name ?? "Driver."} lede="Identity, this company's draws, and Lab Testing Solutions orders. Medical cards and qualification files are not products on this page.">
      <a className="text-sm text-accent hover:underline" href={`/owner/clients/${onboardingId}`}>Back to the company</a>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {driver ? (
        <section className="rounded-xl border border-border bg-card p-5 text-sm">
          <div className="font-mono text-xs text-muted-foreground">{driver.cdl}</div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-4">
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Hire date</dt><dd className="mt-1">{driver.hiredOn ?? "Not recorded"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Testing</dt><dd className="mt-1">{driver.needsTesting ? "In the company pool" : "Not in random testing"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Pool flag</dt><dd className="mt-1">{driver.inRandomPool ? "Included" : "Excluded"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Employment</dt><dd className="mt-1">{driver.employmentStatus}</dd></div>
          </dl>
        </section>
      ) : null}
      {file ? (
        <>
          <section className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4"><h2 className="text-2xl">LTS orders</h2></div>
            <ul className="divide-y divide-border">
              {file.orders.map((order) => (
                <li key={order.id} className="px-5 py-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{catalogItem(order.sku)?.label ?? order.sku}</span>
                    <Badge tone={order.status === "dispatch_pending" || order.status === "paid" ? "warn" : "idle"}>{order.status.replaceAll("_", " ")}</Badge>
                    {order.clearinghouse === "awaiting_owner" ? <Badge tone="danger">Clearinghouse decision open</Badge> : null}
                    {order.clearinghouse === "recorded" || order.clearinghouse === "withheld" ? <Badge tone="idle">{order.clearinghouse}</Badge> : null}
                  </div>
                  <div className="mt-1 text-muted-foreground">{order.reason} · {String(order.createdAt).slice(0, 10)}</div>
                  {order.clearinghouseDecidedAt ? <div className="mt-1 text-xs text-muted-foreground">Decision {order.clearinghouse} by {order.clearinghouseActorUserId ?? "owner"} at {String(order.clearinghouseDecidedAt).slice(0, 16).replace("T", " ")}</div> : null}
                </li>
              ))}
              {!file.orders.length ? <li className="px-5 py-6 text-sm text-muted-foreground">No LTS order is tied to this driver yet.</li> : null}
            </ul>
          </section>
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-2xl">Draws</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {file.selections.map((row) => <li key={row.id}>{row.period} · {row.testKind}</li>)}
              {!file.selections.length ? <li className="text-muted-foreground">Not selected this year.</li> : null}
            </ul>
          </section>
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-2xl">History</h2>
            <ol className="mt-4 space-y-3">
              {file.timeline.map((event, index) => (
                <li key={`${event.at}-${index}`} className="border-l border-border pl-4 text-sm">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{event.kind}</div>
                  <div className="mt-1">{event.title}</div>
                  <div className="text-muted-foreground">{event.detail}</div>
                </li>
              ))}
            </ol>
          </section>
        </>
      ) : null}
    </OwnerFrame>
  );
}
