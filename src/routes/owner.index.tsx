import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { OwnerFrame, ownerHeaders } from "@/components/owner-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignInButtons, SignInGate } from "@/lib/auth/gates";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/owner/")({
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

type CompanyPace = {
  id: string;
  organizationName: string;
  pool: number;
  drugDraws: number;
  drugExpected: number;
  alcoholDraws: number;
  alcoholExpected: number;
  behind: boolean;
  smallFleet: boolean;
  eligible: boolean;
};

type Brief = {
  newClients: number;
  driversAdded: number;
  paidNotSent: number;
  resultsWaiting: number;
  positives: number;
  refusals: number;
  pastDueCards: number;
};

function OwnerPortal() {
  const [data, setData] = useState<OwnerData | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [companies, setCompanies] = useState<CompanyPace[]>([]);
  const [rollup, setRollup] = useState({ behind: 0, withPool: 0 });
  const [quarter, setQuarter] = useState(1);
  const [recentClients, setRecentClients] = useState<Array<{ organizationName: string }>>([]);
  const [recentDrivers, setRecentDrivers] = useState<Array<{ name: string; organizationName: string }>>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
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
      const desk = (await deskResponse.json()) as {
        book?: Book;
        brief?: Brief;
        quarter?: number;
        pace?: { behind: number; withPool: number };
        companyPace?: CompanyPace[];
        recentClients?: Array<{ organizationName: string }>;
        recentDrivers?: Array<{ name: string; organizationName: string }>;
      };
      setBook(desk.book ?? null);
      setBrief(desk.brief ?? null);
      setQuarter(desk.quarter ?? 1);
      setRollup(desk.pace ?? { behind: 0, withPool: 0 });
      setCompanies(desk.companyPace ?? []);
      setRecentClients(desk.recentClients ?? []);
      setRecentDrivers(desk.recentDrivers ?? []);
    }
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Owner data unavailable"));
  }, []);

  async function resolve(id: string) {
    const note = (notes[id] ?? "").trim();
    if (!note) {
      setError("A note is required to acknowledge an exception.");
      return;
    }
    const response = await fetch("/api/v1/exceptions/resolve", {
      method: "POST",
      credentials: "include",
      headers: ownerHeaders(true),
      body: JSON.stringify({ id, note }),
    });
    const json = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(json.error ?? "Could not acknowledge the exception");
      return;
    }
    setError(null);
    await load();
  }

  const clientKind = data?.access.kind === "active_client" || data?.access.kind === "pending_client" || data?.access.kind === "unassigned";
  const behind = companies.filter((company) => company.behind || company.smallFleet);

  return (
    <SignInGate fallback={<OwnerGate />}>
      {clientKind ? <Navigate to="/dashboard" /> : null}
      {data?.access.kind === "owner" ? (
        <OwnerFrame
          title="Today."
          lede="Exceptions only. Each company has its own random pool. A positive or a refusal stays here until you record whether it was reported."
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
          {brief ? (
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <BriefStat label="New clients this week" value={String(brief.newClients)} detail={recentClients.map((item) => item.organizationName).join(", ") || "None yet"} />
              <BriefStat label="Drivers added" value={String(brief.driversAdded)} detail={recentDrivers.map((item) => `${item.name} · ${item.organizationName}`).join(", ") || "None yet"} />
              <BriefStat label={`Q${quarter} companies behind`} value={`${rollup.behind} / ${rollup.withPool}`} detail="Each fleet is paced on its own 50% drug and 10% alcohol rate" warn={rollup.behind > 0} />
              <BriefStat label="Small fleets blocked" value={String(companies.filter((company) => company.smallFleet).length)} detail="A one-driver pool is not a valid standalone random program" warn={companies.some((company) => company.smallFleet)} />
              <BriefStat label="Paid, not sent" value={String(brief.paidNotSent)} detail="Card captured. The lab has not taken the order." warn={brief.paidNotSent > 0} />
              <BriefStat label="Results still out" value={String(brief.resultsWaiting)} detail="Sent to the lab. No result recorded." />
              <BriefStat label="Positives" value={String(brief.positives)} detail="Waiting for your Clearinghouse decision" warn={brief.positives > 0} />
              <BriefStat label="Refusals" value={String(brief.refusals)} detail="Also waiting. Nothing is filed automatically." warn={brief.refusals > 0} />
              <BriefStat label="Cards past due" value={String(brief.pastDueCards)} detail="These clients are not ordering new tests" warn={brief.pastDueCards > 0} />
            </section>
          ) : null}
          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-2xl">Companies behind pace</h2>
                <p className="mt-1 text-sm text-muted-foreground">Year-to-date draws against that company's own pool. Not a combined 50/10.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-border font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Pool</th>
                      <th className="px-4 py-3">Drug</th>
                      <th className="px-4 py-3">Alcohol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(behind.length ? behind : companies).map((company) => (
                      <tr key={company.id} className="border-b border-border">
                        <td className="px-4 py-3">
                          <a className="text-accent hover:underline" href={`/owner/clients/${company.id}`}>{company.organizationName}</a>
                          {company.smallFleet ? <div className="text-xs text-destructive">Too small for a standalone pool</div> : null}
                        </td>
                        <td className="px-4 py-3 tabular-nums">{company.pool}</td>
                        <td className="px-4 py-3 tabular-nums">{company.eligible ? `${company.drugDraws} / ${company.drugExpected}` : "—"}</td>
                        <td className="px-4 py-3 tabular-nums">{company.eligible ? `${company.alcoholDraws} / ${company.alcoholExpected}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!companies.length ? <p className="p-6 text-sm text-muted-foreground">No active company is on a random program.</p> : null}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-2xl">Money, this month</h2>
              <p className="mt-1 text-sm text-muted-foreground">The full book, including what is still prepaid, is on Money. Seats are the contracted amount, not a fresh Stripe pull.</p>
              {book ? (
                <dl className="mt-5 grid grid-cols-2 gap-4">
                  <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Collected</dt><dd className="mt-1 text-2xl tabular-nums">${(book.collectedThisMonthCents / 100).toFixed(0)}</dd></div>
                  <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Prepaid</dt><dd className="mt-1 text-2xl tabular-nums">${(book.prepaidCents / 100).toFixed(0)}</dd></div>
                  <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Lab estimate</dt><dd className="mt-1 text-2xl tabular-nums">${(book.estimatedVendorCents / 100).toFixed(0)}</dd></div>
                  <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Kept</dt><dd className="mt-1 text-2xl tabular-nums">${(book.retainedCents / 100).toFixed(0)}</dd></div>
                </dl>
              ) : null}
            </div>
          </section>
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-2xl">Exception queue</h2>
                <p className="mt-1 text-sm text-muted-foreground">A note is required. If the condition is still true, the next cycle puts it back.</p>
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
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <a className="font-mono text-[10px] text-accent hover:underline" href={`/owner/clients/${item.accountId}`}>{item.accountId}</a>
                      <div className="flex flex-1 flex-col gap-2 sm:max-w-md sm:flex-row">
                        <input
                          value={notes[item.id] ?? ""}
                          onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                          placeholder="Why this can be closed"
                          className="h-9 flex-1 rounded-md border border-border bg-card px-3 text-sm"
                        />
                        <Button size="sm" variant="outline" onClick={() => void resolve(item.id)}>Acknowledge</Button>
                      </div>
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
                      <a className="font-medium text-accent hover:underline" href={`/owner/clients/${item.id}`}>{item.organizationName}</a>
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

function BriefStat({ label, value, detail, warn = false }: { label: string; value: string; detail: string; warn?: boolean }) {
  return (
    <div className={warn ? "rounded-xl border border-destructive/40 bg-card px-4 py-4" : "rounded-xl border border-border bg-card px-4 py-4"}>
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl tabular-nums">{value}</div>
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{detail}</p>
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
