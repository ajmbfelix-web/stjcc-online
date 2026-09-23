import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MoneyTiles, OwnerFrame, ownerHeaders } from "@/components/owner-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignInButtons, SignInGate } from "@/lib/auth/gates";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/owner")({
  head: () => ({ meta: [{ title: pageTitle("SJCC Owner Portal") }, { name: "robots", content: "noindex, nofollow" }] }),
  component: OwnerPortal,
});

type OwnerData = {
  access: { kind: string };
  metrics?: { active: number; pending: number; pastDue: number; drivers: number; selections: number };
  exceptions?: Array<{ id: string; accountId: string; title: string; description: string; severity: string; source: string; createdAt: string }>;
  blocked?: Array<{ id: string; organizationName: string; contactEmail: string; status: string; billingStatus: string }>;
  failedNotifications?: Array<{ id: string; recipient: string; subject: string; error: string | null }>;
  lastRun?: { finishedAt: string; summary: { openOwnerExceptions?: number } } | null;
};

type Book = { collectedThisMonthCents: number; prepaidCents: number; estimatedVendorCents: number; retainedCents: number; awaitingCharge: number; paidNotSent: number; pastDueClients: number };

type Pace = { drugExpected: number; alcoholExpected: number; drugDraws: number; alcoholDraws: number; quarter: number };

function OwnerPortal() {
  const [data, setData] = useState<OwnerData | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [pace, setPace] = useState<Pace | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [portalResponse, deskResponse] = await Promise.all([
      fetch("/api/v1/portal", { headers: ownerHeaders(), credentials: "include" }),
      fetch("/api/owner/desk", { headers: ownerHeaders(), credentials: "include" }),
    ]);
    const portal = (await portalResponse.json()) as OwnerData & { error?: string };
    if (!portalResponse.ok) throw new Error(portal.error ?? "Owner data unavailable");
    setData(portal);
    if (deskResponse.ok) {
      const desk = (await deskResponse.json()) as { book?: Book; pace?: Omit<Pace, "quarter">; quarter?: number };
      setBook(desk.book ?? null);
      setPace(desk.pace ? { ...desk.pace, quarter: desk.quarter ?? 1 } : null);
    }
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Owner data unavailable"));
  }, []);

  async function resolve(id: string) {
    await fetch("/api/v1/exceptions/resolve", {
      method: "POST",
      credentials: "include",
      headers: ownerHeaders(true),
      body: JSON.stringify({ id }),
    });
    await load();
  }

  const clientKind = data?.access.kind === "active_client" || data?.access.kind === "pending_client" || data?.access.kind === "unassigned";

  return (
    <SignInGate fallback={<OwnerGate />}>
      {clientKind ? <Navigate to="/dashboard" /> : null}
      {data?.access.kind === "owner" ? (
        <OwnerFrame
          title="Today."
          lede="Seats, tests, and random draws run without a click. This page is the work that still needs you: a failed card, a paid test the lab has not taken, and any Clearinghouse report you have not decided."
        >
          {error ? <section className="rounded-xl border border-destructive/30 bg-card p-6 text-sm text-destructive">{error}</section> : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge tone="live">Exception desk</Badge>
              {data.lastRun?.finishedAt ? <Badge tone="idle">Last cycle {new Date(data.lastRun.finishedAt).toLocaleString()}</Badge> : null}
            </div>
            <Button variant="outline" size="sm" onClick={() => void load().catch((err) => setError(err instanceof Error ? err.message : "Owner data unavailable"))}>
              Refresh
            </Button>
          </div>
          {book ? <MoneyTiles book={book} /> : null}
          {pace ? (
            <section className="grid gap-3 sm:grid-cols-4">
              <PaceStat label={`Q${pace.quarter} drug pace`} value={`${pace.drugDraws} / ${pace.drugExpected}`} />
              <PaceStat label={`Q${pace.quarter} alcohol pace`} value={`${pace.alcoholDraws} / ${pace.alcoholExpected}`} />
              <PaceStat label="Open exceptions" value={String(data.exceptions?.length ?? 0)} />
              <PaceStat label="Active clients" value={String(data.metrics?.active ?? 0)} />
            </section>
          ) : null}
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-2xl">Exception queue</h2>
                <p className="mt-1 text-sm text-muted-foreground">Acknowledging an item hides it. If the condition is still true, the next cycle puts it back.</p>
              </div>
              <div className="space-y-3 p-4">
                {data.exceptions?.map((item) => (
                  <article key={item.id} className="rounded-lg border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Badge tone={item.severity === "critical" || item.severity === "high" ? "danger" : "warn"}>{item.severity}</Badge>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{item.source}</span>
                    </div>
                    <h3 className="mt-3 text-lg">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] text-subtle">{item.accountId}</span>
                      <Button size="sm" variant="outline" onClick={() => void resolve(item.id)}>Acknowledge</Button>
                    </div>
                  </article>
                ))}
                {!data.exceptions?.length ? <p className="p-8 text-center text-sm text-muted-foreground">Queue is clear.</p> : null}
              </div>
            </div>
            <div className="space-y-6">
              <section className="rounded-xl border border-border bg-card">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-2xl">Blocked activations</h2>
                </div>
                <div className="space-y-3 p-4">
                  {data.blocked?.map((item) => (
                    <article key={item.id} className="rounded-lg border border-border p-4">
                      <div className="font-medium">{item.organizationName}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{item.contactEmail}</div>
                      <div className="mt-3 flex gap-2">
                        <Badge tone="warn">{item.status.replaceAll("_", " ")}</Badge>
                        <Badge tone="idle">{item.billingStatus.replaceAll("_", " ")}</Badge>
                      </div>
                    </article>
                  ))}
                  {!data.blocked?.length ? <p className="p-4 text-sm text-muted-foreground">No organization is stuck.</p> : null}
                </div>
              </section>
              <section className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-2xl">Failed notices</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  {data.failedNotifications?.map((item) => (
                    <li key={item.id}>
                      <div className="font-medium">{item.subject}</div>
                      <div className="text-muted-foreground">{item.recipient}</div>
                      {item.error ? <div className="text-destructive">{item.error}</div> : null}
                    </li>
                  ))}
                  {!data.failedNotifications?.length ? <li className="text-muted-foreground">No failed deliveries.</li> : null}
                </ul>
              </section>
            </div>
          </section>
        </OwnerFrame>
      ) : null}
    </SignInGate>
  );
}

function PaceStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl tabular-nums">{value}</div>
    </div>
  );
}

function OwnerGate() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <Badge tone="idle">Restricted operations</Badge>
        <h1 className="mt-4 text-4xl">Owner access required.</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Sign in with the SJCC owner account. Client accounts are sent to their own portal.</p>
        <div className="mt-6 flex justify-center">
          <SignInButtons callbackURL="/owner" />
        </div>
        <Link to="/" className="mt-5 inline-block text-sm text-accent hover:underline">Return to site</Link>
      </section>
    </main>
  );
}
