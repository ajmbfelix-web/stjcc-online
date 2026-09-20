import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Radio,
  Webhook,
} from "lucide-react";
import { Wordmark } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignInButtons, SignInGate } from "@/lib/auth/gates";
import { getBearerToken } from "@/lib/auth/client";
import type { DriverRecord, ScreeningStatus, WebhookEvent } from "@/lib/compliance/types";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: pageTitle("Owner Compliance Workspace") },
      {
        name: "description",
        content:
          "Restricted SJCC workspace for authorized compliance operations, screening status, and audit reporting.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: canonical("/dashboard") }],
  }),
  component: Dashboard,
});

const seed: DriverRecord[] = [
  {
    id: "drv_01",
    name: "Record A",
    cdl: "REDACTED",
    testType: "5_PANEL",
    status: "COLLECTION_PENDING",
    barcode: "INTERNAL",
    updatedAt: "2026-09-19T18:12:00.000Z",
  },
  {
    id: "drv_02",
    name: "Record B",
    cdl: "REDACTED",
    testType: "5_PANEL",
    status: "CLEARED",
    barcode: "INTERNAL",
    updatedAt: "2026-09-18T14:41:00.000Z",
  },
  {
    id: "drv_03",
    name: "Record C",
    cdl: "REDACTED",
    testType: "MVR",
    status: "EXCEPTION",
    barcode: "INTERNAL",
    updatedAt: "2026-09-17T09:05:00.000Z",
  },
  {
    id: "drv_04",
    name: "Record D",
    cdl: "REDACTED",
    testType: "5_PANEL",
    status: "COLLECTION_PENDING",
    barcode: "INTERNAL",
    updatedAt: "2026-09-19T16:28:00.000Z",
  },
  {
    id: "drv_05",
    name: "Record E",
    cdl: "REDACTED",
    testType: "MVR",
    status: "CLEARED",
    barcode: "INTERNAL",
    updatedAt: "2026-09-16T21:10:00.000Z",
  },
];

function statusTone(status: ScreeningStatus) {
  if (status === "CLEARED") return "ok" as const;
  if (status === "EXCEPTION" || status === "MRO_HOLD") return "danger" as const;
  if (status === "COLLECTION_COMPLETE") return "warn" as const;
  return "live" as const;
}

function labelStatus(status: ScreeningStatus) {
  return status.replaceAll("_", " ");
}

function labelTest(type: DriverRecord["testType"]) {
  if (type === "5_PANEL") return "5-Panel";
  if (type === "9_PANEL") return "9-Panel";
  if (type === "10_PANEL") return "10-Panel";
  if (type === "BAT") return "Breath Alcohol";
  if (type === "HAIR") return "Hair";
  return "MVR";
}

function Dashboard() {
  const [drivers, setDrivers] = useState<DriverRecord[]>(seed);
  const [events, setEvents] = useState<WebhookEvent[]>([
    {
      id: "evt_boot",
      receivedAt: "2026-09-19T12:00:00.000Z",
      source: "SYSTEM",
      path: "/api/v1/webhooks/lab-results",
      payload: {
        event: "listener.ready",
        partner: "stjcc",
        message: "Lab-results listener ready. Awaiting certified network callbacks.",
      },
    },
  ]);
  const [busy, setBusy] = useState<"order" | "hook" | null>(null);

  useEffect(() => {
    let active = true;
    const token = getBearerToken();

    fetch("/api/v1/dashboard", {
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (res) => {
        const json = (await res.json()) as {
          drivers?: DriverRecord[];
          events?: WebhookEvent[];
          error?: string;
        };
        if (!res.ok) throw new Error(json.error ?? "Dashboard data unavailable");
        if (!active) return;
        setDrivers(json.drivers ?? []);
        setEvents(json.events ?? []);
      })
      .catch((err: unknown) => {
        if (active) toast.error(err instanceof Error ? err.message : "Dashboard data unavailable");
      });

    return () => {
      active = false;
    };
  }, []);

  async function simulateOrder() {
    setBusy("order");
    try {
      const body = {
        accountId: "SJCC-DEMO",
        driver: {
          name: "Demo Driver",
          cdl: "REDACTED",
        },
        testType: "5_PANEL",
        collectionNetwork: "SAMHSA_CERTIFIED_NETWORK",
        callbackUrl: "https://stjcc.online/api/v1/webhooks/lab-results",
      };
      const token = getBearerToken();
      const res = await fetch("/api/v1/orders/dispatch", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        order?: { orderId: string; barcode: string; driver: DriverRecord };
        event?: WebhookEvent;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Dispatch failed");
      if (json.order?.driver) {
        setDrivers((prev) => [json.order!.driver, ...prev.filter((d) => d.id !== json.order!.driver.id)]);
      }
      if (json.event) setEvents((prev) => [json.event!, ...prev]);
      toast.success("Compliance order dispatched");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Dispatch failed");
    } finally {
      setBusy(null);
    }
  }

  async function simulateWebhook() {
    setBusy("hook");
    try {
      const pending = drivers.find(
        (d) => d.status === "COLLECTION_PENDING" || d.status === "COLLECTION_COMPLETE",
      );
      const body = {
        event: "mro.result",
        orderId: pending?.id ?? "ord_sim",
        driverId: pending?.id,
        barcode: pending?.barcode,
        status: "NEGATIVE",
        result: "Negative / Cleared",
        mroReviewedAt: new Date().toISOString(),
      };
      const token = getBearerToken();
      const res = await fetch("/api/v1/webhooks/lab-results", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        driver?: DriverRecord;
        event?: WebhookEvent;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Webhook failed");
      if (json.driver) {
        setDrivers((prev) => prev.map((d) => (d.id === json.driver!.id ? json.driver! : d)));
      } else if (pending) {
        setDrivers((prev) =>
          prev.map((d) =>
            d.id === pending.id
              ? { ...d, status: "CLEARED", updatedAt: new Date().toISOString() }
              : d,
          ),
        );
      }
      if (json.event) setEvents((prev) => [json.event!, ...prev]);
      toast.success("MRO callback applied");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Webhook failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <SignInGate fallback={<OwnerSignIn />}>
      <div className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex size-11 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
              aria-label="Back to site"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <Wordmark compact />
          </div>
          <Badge tone="live">Mission control</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-3">
          <Stat label="Open collections" value={drivers.filter((d) => d.status.includes("COLLECTION")).length} />
          <Stat label="Cleared" value={drivers.filter((d) => d.status === "CLEARED").length} />
          <Stat label="Webhook events" value={events.length} />
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-medium">Compliance engine simulation</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Exercise dispatch and certified lab-result processing against simulated
                routes. No client records are used in this workspace.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={simulateOrder} disabled={busy !== null}>
                {busy === "order" ? <Loader2 className="size-4 animate-spin" /> : <Radio className="size-4" />}
                Simulate Order Dispatch
              </Button>
              <Button variant="outline" onClick={simulateWebhook} disabled={busy !== null}>
                {busy === "hook" ? <Loader2 className="size-4 animate-spin" /> : <Webhook className="size-4" />}
                Simulate Lab Result Callback
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-medium">Live driver & screening table</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {drivers.length} records
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Driver</th>
                  <th className="px-5 py-3 font-medium">CDL #</th>
                  <th className="px-5 py-3 font-medium">Test type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Barcode pass</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((row) => (
                  <tr key={row.id} className="border-b border-border/70 last:border-0">
                    <td className="px-5 py-3 font-medium">{row.name}</td>
                    <td className="px-5 py-3 font-mono text-xs tabular-nums">{row.cdl}</td>
                    <td className="px-5 py-3 text-muted-foreground">{labelTest(row.testType)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={statusTone(row.status)}>{labelStatus(row.status)}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <a
                        href={`#pass-${row.barcode}`}
                        className="inline-flex items-center gap-1 font-mono text-xs text-accent hover:underline"
                      >
                        {row.barcode}
                        <ExternalLink className="size-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Activity className="size-4 text-accent" />
            <h2 className="text-sm font-medium">Webhook event log</h2>
          </div>
          <div className="max-h-[420px] space-y-3 overflow-y-auto p-4">
            {events.map((evt) => (
              <article key={evt.id} className="rounded-lg border border-border bg-background p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge tone={evt.source === "WEBHOOK" ? "live" : "idle"}>{evt.source}</Badge>
                  <span className="font-mono text-[11px] text-muted-foreground">{evt.path}</span>
                  <span className="ml-auto font-mono text-[11px] tabular-nums text-subtle">
                    {evt.receivedAt}
                  </span>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {JSON.stringify(evt.payload, null, 2)}
                </pre>
              </article>
            ))}
          </div>
        </section>
      </main>
      </div>
    </SignInGate>
  );
}

function OwnerSignIn() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-7 text-center shadow-sm">
        <Badge tone="idle">Restricted workspace</Badge>
        <h1 className="mt-4 text-2xl font-medium">SJCC owner sign-in</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This workspace contains confidential screening records, results, and audit reports.
          It is for authorized SJCC staff only.
        </p>
        <div className="mt-6 flex justify-center">
          <SignInButtons callbackURL="/dashboard" />
        </div>
        <Link to="/" className="mt-5 inline-block text-sm text-accent hover:underline">
          Return to public services
        </Link>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-medium tabular-nums">{value}</div>
    </div>
  );
}
