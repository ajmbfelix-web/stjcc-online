import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/logo";
import { SignInButtons, SignInGate } from "@/lib/auth/gates";
import { getBearerToken } from "@/lib/auth/client";
import { DRIVER_MONTHLY_CENTS, money } from "@/lib/billing/catalog";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: pageTitle("Client Compliance Portal") }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ClientPortal,
});

type ChecklistItem = { id: string; label: string; state: "complete" | "waiting" | "blocked"; detail: string };
type RosterDriver = {
  id: string;
  name: string;
  cdl: string;
  medicalCardExpiresOn: string | null;
  mvrReviewedOn: string | null;
  clearinghouseQueriedOn: string | null;
  hiredOn: string | null;
};
type ClientData = {
  access: { kind: "active_client" | "pending_client" | "unassigned" | "owner"; status?: string; billingStatus?: string };
  onboarding?: { organizationName: string; dotNumber: string; status: string; billingStatus?: string; billedDrivers?: number } | null;
  checklist?: ChecklistItem[];
  roster?: RosterDriver[];
  selections?: Array<{ id: string; testKind: string; name: string; orderStatus: string | null }>;
  exceptions?: Array<{ id: string; title: string; description: string; severity: string }>;
  history?: {
    orders: Array<{ id: string; sku: string; status: string; candidateName: string; createdAt: string }>;
    notices: Array<{ id: string; subject: string; status: string; createdAt: string }>;
    pace: { pool: number; drugDraws: number; drugAnnual: number; alcoholDraws: number; alcoholAnnual: number; drugExpected: number; alcoholExpected: number } | null;
  };
};

function authHeaders(json = false): HeadersInit {
  const token = getBearerToken();
  return {
    ...(json ? { "content-type": "application/json" } : {}),
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

function ClientPortal() {
  const [data, setData] = useState<ClientData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/v1/portal", { headers: authHeaders(), credentials: "include" });
    const json = (await response.json()) as ClientData & { error?: string };
    if (!response.ok) throw new Error(json.error ?? "Portal unavailable");
    setData(json);
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Portal unavailable"));
  }, []);

  async function saveDriver(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/v1/roster", {
      method: "POST",
      credentials: "include",
      headers: authHeaders(true),
      body: JSON.stringify({
        name: form.get("name"),
        cdl: form.get("cdl"),
        hiredOn: form.get("hiredOn") || null,
        medicalCardExpiresOn: form.get("medicalCardExpiresOn") || null,
        mvrReviewedOn: form.get("mvrReviewedOn") || null,
        clearinghouseQueriedOn: form.get("clearinghouseQueriedOn") || null,
        needsTesting: form.get("needsTesting") === "on",
      }),
    });
    const json = (await response.json()) as { error?: string; seat?: { chargedCents: number; billedDrivers: number } };
    if (!response.ok) {
      setNotice(json.error ?? "Could not save the driver");
      return;
    }
    event.currentTarget.reset();
    const charged = json.seat?.chargedCents ?? 0;
    const seats = json.seat?.billedDrivers ?? data?.onboarding?.billedDrivers ?? 0;
    setNotice(
      charged > 0
        ? `Driver saved. ${money(charged)} was charged today. Monthly testing is now ${seats} × ${money(DRIVER_MONTHLY_CENTS)}.`
        : `Driver saved. Monthly testing stays at ${seats} × ${money(DRIVER_MONTHLY_CENTS)}. No additional charge was due today.`,
    );
    await load();
  }

  async function openBilling() {
    setNotice(null);
    const response = await fetch("/api/billing/portal", { method: "POST", credentials: "include", headers: authHeaders() });
    const json = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !json.url) {
      setNotice(json.error ?? "The card update page is not available yet");
      return;
    }
    window.location.href = json.url;
  }

  return (
    <SignInGate fallback={<ClientGate />}>
      <main className="min-h-dvh bg-background">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Link to="/" aria-label="Back to site" className="inline-flex size-10 items-center justify-center rounded-md border border-border">
                <ArrowLeft className="size-4" />
              </Link>
              <Wordmark compact />
            </div>
            <Badge tone="live">Client portal</Badge>
          </div>
        </header>
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
          {error ? <section className="rounded-xl border border-destructive/30 bg-card p-6 text-sm text-destructive">{error}</section> : null}
          {data?.access.kind === "owner" ? <Navigate to="/owner" /> : null}
          {data?.access.kind === "unassigned" ? <OnboardingRequired /> : null}
          {data?.access.kind === "pending_client" ? <PendingState data={data} /> : null}
          {data?.access.kind === "active_client" ? (
            <>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{data.onboarding?.organizationName ?? "Your organization"}</p>
                <h1 className="mt-3 text-5xl">Compliance is running.</h1>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                  Testing seats are {money(DRIVER_MONTHLY_CENTS)} per driver per month, collected before the month starts. Adding a driver beyond the seats already paid charges {money(DRIVER_MONTHLY_CENTS)} that day.
                  {typeof data.onboarding?.billedDrivers === "number"
                    ? ` This organization is paying for ${data.onboarding.billedDrivers} seat${data.onboarding.billedDrivers === 1 ? "" : "s"} (${money(data.onboarding.billedDrivers * DRIVER_MONTHLY_CENTS)}/month).`
                    : ""}
                </p>
                <Button type="button" variant="outline" className="mt-4" onClick={() => void openBilling()}>
                  Update card
                </Button>
              </div>
              {data.access.billingStatus === "past_due" ? (
                <section className="rounded-xl border border-warn/40 bg-card p-5 text-sm">
                  The last subscription payment failed. Update the card in Stripe. Tracking stays on until the subscription itself ends.
                </section>
              ) : null}
              <section className="grid gap-4 sm:grid-cols-3">
                <Stat label="Drivers" value={data.roster?.length ?? 0} />
                <Stat label="Actions for you" value={data.exceptions?.length ?? 0} />
                <Stat label="Draws this quarter" value={data.selections?.length ?? 0} />
              </section>
              <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-xl border border-border bg-card">
                  <div className="border-b border-border px-5 py-4">
                    <h2 className="text-2xl">Roster</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Existing drivers need their real hire date so a new pre-employment test is not ordered.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-sm">
                      <thead className="border-b border-border font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        <tr>
                          <th className="px-5 py-3">Driver</th>
                          <th className="px-5 py-3">Medical</th>
                          <th className="px-5 py-3">MVR</th>
                          <th className="px-5 py-3">Clearinghouse</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.roster?.map((driver) => (
                          <tr key={driver.id} className="border-b border-border/70 last:border-0">
                            <td className="px-5 py-4">
                              <div className="font-medium">{driver.name}</div>
                              <div className="font-mono text-xs text-muted-foreground">{driver.cdl}</div>
                            </td>
                            <td className="px-5 py-4">{driver.medicalCardExpiresOn ?? "Missing"}</td>
                            <td className="px-5 py-4">{driver.mvrReviewedOn ?? "Missing"}</td>
                            <td className="px-5 py-4">{driver.clearinghouseQueriedOn ?? "Missing"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!data.roster?.length ? <p className="p-8 text-center text-sm text-muted-foreground">Add the first driver. SJCC takes the next compliance step.</p> : null}
                  </div>
                </div>
                <div className="space-y-6">
                  <section className="rounded-xl border border-border bg-card">
                    <div className="border-b border-border px-5 py-4">
                      <h2 className="text-2xl">Your actions</h2>
                    </div>
                    <div className="space-y-3 p-4">
                      {data.exceptions?.map((item) => (
                        <article key={item.id} className="rounded-lg border border-border bg-background p-4">
                          <Badge tone={item.severity === "critical" || item.severity === "high" ? "danger" : "warn"}>{item.severity}</Badge>
                          <h3 className="mt-3 text-lg">{item.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                        </article>
                      ))}
                      {!data.exceptions?.length ? (
                        <div className="p-6 text-center">
                          <CheckCircle2 className="mx-auto size-7 text-ok" />
                          <p className="mt-3 text-sm text-muted-foreground">Nothing is waiting on you.</p>
                        </div>
                      ) : null}
                    </div>
                  </section>
                  <section className="rounded-xl border border-border bg-card p-5">
                    <h2 className="text-2xl">This company, this year</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Draws are only drivers at {data.onboarding?.organizationName ?? "this company"}. Other SJCC clients are a different pool.</p>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div><dt className="text-muted-foreground">Covered drivers</dt><dd className="tabular-nums">{data.history?.pace?.pool ?? 0}</dd></div>
                      <div><dt className="text-muted-foreground">Drug selected</dt><dd className="tabular-nums">{data.history?.pace?.drugDraws ?? 0} / {data.history?.pace?.drugAnnual ?? 0}</dd></div>
                      <div><dt className="text-muted-foreground">Alcohol selected</dt><dd className="tabular-nums">{data.history?.pace?.alcoholDraws ?? 0} / {data.history?.pace?.alcoholAnnual ?? 0}</dd></div>
                      <div><dt className="text-muted-foreground">Quarter pace</dt><dd className="tabular-nums">{data.history?.pace?.drugExpected ?? 0} drug · {data.history?.pace?.alcoholExpected ?? 0} alcohol</dd></div>
                    </dl>
                    <h3 className="mt-6 text-lg">This quarter</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      {data.selections?.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-3">
                          <span>{item.name}</span>
                          <Badge tone="live">{item.testKind}</Badge>
                        </li>
                      ))}
                      {!data.selections?.length ? <li className="text-muted-foreground">No one from your company was drawn this quarter.</li> : null}
                    </ul>
                  </section>
                </div>
              </section>
              <form onSubmit={saveDriver} className="grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
                <h2 className="text-2xl sm:col-span-2">Add or update a driver</h2>
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  Leave “Needs testing” checked to keep the {money(DRIVER_MONTHLY_CENTS)} monthly seat. Unchecking it removes the driver from random testing. The current month is not refunded.
                </p>
                <Field name="name" label="Driver name" required />
                <Field name="cdl" label="CDL number" required />
                <Field name="hiredOn" label="Hire date" type="date" />
                <Field name="medicalCardExpiresOn" label="Medical card expires" type="date" />
                <Field name="mvrReviewedOn" label="MVR reviewed" type="date" />
                <Field name="clearinghouseQueriedOn" label="Clearinghouse queried" type="date" />
                <label className="flex items-center gap-3 text-sm sm:col-span-2">
                  <input name="needsTesting" type="checkbox" defaultChecked className="size-4 accent-[var(--color-primary)]" />
                  Needs testing — {money(DRIVER_MONTHLY_CENTS)} per month
                </label>
                {notice ? <p className="text-sm text-muted-foreground sm:col-span-2">{notice}</p> : null}
                <Button type="submit" className="sm:col-span-2 sm:w-fit">Save driver</Button>
              </form>
              <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="text-2xl">Orders</h2>
                  <ul className="mt-4 space-y-2 text-sm">
                    {data.history?.orders.map((order) => (
                      <li key={order.id} className="flex items-center justify-between gap-3">
                        <span>{order.candidateName} · {order.sku}</span>
                        <span className="text-muted-foreground">{order.status.replaceAll("_", " ")}</span>
                      </li>
                    ))}
                    {!data.history?.orders.length ? <li className="text-muted-foreground">No tests or screens have been ordered yet.</li> : null}
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="text-2xl">Notices</h2>
                  <ul className="mt-4 space-y-2 text-sm">
                    {data.history?.notices.map((notice) => (
                      <li key={notice.id}>
                        <div>{notice.subject}</div>
                        <div className="text-muted-foreground">{notice.status}</div>
                      </li>
                    ))}
                    {!data.history?.notices.length ? <li className="text-muted-foreground">No notices yet.</li> : null}
                  </ul>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </main>
    </SignInGate>
  );
}

function PendingState({ data }: { data: ClientData }) {
  return (
    <section className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-8">
      <Badge tone="warn">Activation in progress</Badge>
      <h1 className="mt-4 text-4xl">{data.onboarding?.organizationName ?? "Your organization"} is not active yet.</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        The portal opens automatically when billing is confirmed. There is no manual approval step.
      </p>
      <ol className="mt-6 space-y-4">
        {data.checklist?.map((item) => (
          <li key={item.id} className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg">{item.label}</h2>
              <Badge tone={item.state === "complete" ? "ok" : item.state === "blocked" ? "danger" : "warn"}>{item.state}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function OnboardingRequired() {
  return (
    <section className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-8">
      <Badge tone="warn">Setup required</Badge>
      <h1 className="mt-4 text-4xl">This account is not linked to an organization.</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Start onboarding, then use the claim code while signed in. Pending organizations cannot open another company's compliance data.
      </p>
      <Button asChild className="mt-7">
        <Link to="/onboarding">Start onboarding</Link>
      </Button>
    </section>
  );
}

function ClientGate() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <Badge tone="idle">Client portal</Badge>
        <h1 className="mt-4 text-4xl">Sign in to continue.</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Active organizations land here. Incomplete setups return to onboarding.</p>
        <div className="mt-6 flex justify-center">
          <SignInButtons callbackURL="/dashboard" />
        </div>
        <Link to="/onboarding" className="mt-5 inline-block text-sm text-accent hover:underline">Start organization onboarding</Link>
      </section>
    </main>
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

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input name={name} type={type} required={required} className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 outline-none focus:ring-2 focus:ring-ring/50" />
    </label>
  );
}
