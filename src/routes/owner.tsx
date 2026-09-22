import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/logo";
import { SignInButtons, SignInGate } from "@/lib/auth/gates";
import { getBearerToken } from "@/lib/auth/client";
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

function authHeaders(json = false): HeadersInit {
  const token = getBearerToken();
  return {
    ...(json ? { "content-type": "application/json" } : {}),
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

function OwnerPortal() {
  const [data, setData] = useState<OwnerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/v1/portal", { headers: authHeaders(), credentials: "include" });
    const json = (await response.json()) as OwnerData & { error?: string };
    if (!response.ok) throw new Error(json.error ?? "Owner data unavailable");
    setData(json);
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Owner data unavailable"));
  }, []);

  async function resolve(id: string) {
    await fetch("/api/v1/exceptions/resolve", {
      method: "POST",
      credentials: "include",
      headers: authHeaders(true),
      body: JSON.stringify({ id }),
    });
    await load();
  }

  const clientKind = data?.access.kind === "active_client" || data?.access.kind === "pending_client" || data?.access.kind === "unassigned";

  return (
    <SignInGate fallback={<OwnerGate />}>
      <main className="min-h-dvh bg-background">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Link to="/" aria-label="Back to site" className="inline-flex size-10 items-center justify-center rounded-md border border-border">
                <ArrowLeft className="size-4" />
              </Link>
              <Wordmark compact />
            </div>
            <div className="flex items-center gap-3">
              <Badge tone="live">Exception center</Badge>
              <Button asChild variant="outline" size="sm">
                <a href="/api/owner/reports/operations"><Download className="size-4" />Export</a>
              </Button>
              <Button variant="outline" size="sm" onClick={() => void load().catch((err) => setError(err instanceof Error ? err.message : "Owner data unavailable"))}>
                <RefreshCw className="size-4" />Refresh
              </Button>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
          {clientKind ? <Navigate to="/dashboard" /> : null}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">St. Joseph Compliance Company</p>
            <h1 className="mt-3 text-5xl">Only exceptions reach you.</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Onboarding, billing, random draws, reminders, and negative results run without a click. This screen is the work that could not be automated.
            </p>
          </div>
          {error ? <section className="rounded-xl border border-destructive/30 bg-card p-6 text-sm text-destructive">{error}</section> : null}
          {data?.access.kind === "owner" ? (
            <>
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Stat label="Open exceptions" value={data.exceptions?.length ?? 0} />
                <Stat label="Active clients" value={data.metrics?.active ?? 0} />
                <Stat label="Still activating" value={data.metrics?.pending ?? 0} />
                <Stat label="Billing attention" value={data.metrics?.pastDue ?? 0} />
                <Stat label="Quarter draws" value={data.metrics?.selections ?? 0} />
              </section>
              <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-xl border border-border bg-card">
                  <div className="border-b border-border px-5 py-4">
                    <h2 className="text-2xl">Exception queue</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Resolving an item hides it. If the condition is still true, the next cycle puts it back.
                    </p>
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
                    {data.lastRun?.finishedAt ? (
                      <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                        Last cycle {new Date(data.lastRun.finishedAt).toLocaleString()}
                      </p>
                    ) : null}
                  </section>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </main>
    </SignInGate>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl tabular-nums">{value}</div>
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
