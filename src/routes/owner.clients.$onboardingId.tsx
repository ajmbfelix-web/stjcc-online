import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { OwnerFrame, ownerHeaders } from "@/components/owner-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignInGate } from "@/lib/auth/gates";
import { catalogItem } from "@/lib/billing/catalog";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/owner/clients/$onboardingId")({
  head: () => ({ meta: [{ title: pageTitle("Account") }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <SignInGate><AccountPage /></SignInGate>,
});

type File = {
  organization: {
    id: string;
    organizationName: string;
    dotNumber: string;
    contactName: string;
    contactEmail: string;
    status: string;
    billingStatus: string;
    billedDrivers: number;
    poolMode: string;
    services: string[];
  };
  pace: {
    pool: number;
    drugDraws: number;
    drugAnnual: number;
    alcoholDraws: number;
    alcoholAnnual: number;
    smallFleet: boolean;
    behind: boolean;
  };
  now: {
    exceptions: Array<{ id: string; title: string; description: string; severity: string }>;
    unpaid: Array<{ id: string; candidateName: string; sku: string }>;
    paidNotSent: Array<{ id: string; candidateName: string; sku: string; status: string }>;
    pastDue: boolean;
    smallFleet: boolean;
  };
  drivers: Array<{ id: string; name: string; cdl: string; hiredOn: string | null; needsTesting: boolean }>;
  timeline: Array<{ at: string; kind: string; title: string; detail: string }>;
  notes: Array<{ id: string; body: string; createdAt: string }>;
};

function AccountPage() {
  const { onboardingId } = Route.useParams();
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await fetch(`/api/owner/accounts/${onboardingId}`, { headers: ownerHeaders(), credentials: "include" });
    const json = (await response.json()) as File & { error?: string };
    if (!response.ok) throw new Error(json.error ?? "Account unavailable");
    setFile(json);
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Account unavailable"));
  }, [onboardingId]);

  async function saveNote(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(`/api/owner/accounts/${onboardingId}/notes`, {
      method: "POST",
      credentials: "include",
      headers: ownerHeaders(true),
      body: JSON.stringify({ body: note }),
    });
    const json = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(json.error ?? "Note was not saved");
      return;
    }
    setNote("");
    setError(null);
    await load();
  }

  const org = file?.organization;
  return (
    <OwnerFrame title={org?.organizationName ?? "Account."} lede="One company file. Selections listed here are this company's drivers. The consortium rate is not computed on this page.">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {org ? (
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap gap-2">
            <Badge tone={org.status === "active" ? "live" : "warn"}>{org.status.replaceAll("_", " ")}</Badge>
            <Badge tone={org.billingStatus === "past_due" ? "danger" : "idle"}>{org.billingStatus.replaceAll("_", " ")}</Badge>
            <Badge tone="idle">{org.poolMode}</Badge>
          </div>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">DOT</dt><dd className="mt-1 font-mono">{org.dotNumber}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Contact</dt><dd className="mt-1">{org.contactName}<div className="text-muted-foreground">{org.contactEmail}</div></dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Seats</dt><dd className="mt-1 tabular-nums">{org.billedDrivers}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Covered pool</dt><dd className="mt-1 tabular-nums">{file.pace.pool}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Drug this year</dt><dd className="mt-1 tabular-nums">{file.pace.drugDraws} / {file.pace.drugAnnual}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Alcohol this year</dt><dd className="mt-1 tabular-nums">{file.pace.alcoholDraws} / {file.pace.alcoholAnnual}</dd></div>
            <div className="sm:col-span-2"><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Services</dt><dd className="mt-1">{org.services.length ? org.services.join(", ") : "None selected"}</dd></div>
          </dl>
          <a className="mt-4 inline-block text-sm text-accent hover:underline" href={`/api/owner/reports/audit?onboardingId=${org.id}`}>Audit packet</a>
        </section>
      ) : null}
      {file ? (
        <>
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-2xl">Now</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {file.now.smallFleet ? <li>This company has fewer than two testing drivers, so it is not in the SJCC consortium. A pool of one is not valid under 49 CFR 382.305.</li> : null}
              {file.now.pastDue ? <li>Billing is past due or the subscription ended.</li> : null}
              {file.now.unpaid.map((order) => <li key={order.id}>Unpaid {label(order.sku)} for {order.candidateName}.</li>)}
              {file.now.paidNotSent.map((order) => <li key={order.id}>Paid, not sent: {label(order.sku)} for {order.candidateName}.</li>)}
              {file.now.exceptions.map((item) => <li key={item.id}><span className="font-medium">{item.title}.</span> {item.description}</li>)}
              {!file.now.smallFleet && !file.now.pastDue && !file.now.unpaid.length && !file.now.paidNotSent.length && !file.now.exceptions.length ? <li className="text-muted-foreground">Nothing on this company needs you.</li> : null}
            </ul>
          </section>
          <section className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4"><h2 className="text-2xl">Drivers</h2></div>
            <ul className="divide-y divide-border">
              {file.drivers.map((driver) => (
                <li key={driver.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <a className="text-accent hover:underline" href={`/owner/clients/${onboardingId}/drivers/${driver.id}`}>{driver.name}</a>
                  <span className="font-mono text-xs text-muted-foreground">{driver.cdl} · {driver.needsTesting ? "testing" : "not testing"}</span>
                </li>
              ))}
              {!file.drivers.length ? <li className="px-5 py-6 text-sm text-muted-foreground">No drivers on file.</li> : null}
            </ul>
          </section>
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-2xl">History</h2>
            <ol className="mt-4 space-y-3">
              {file.timeline.map((event, index) => (
                <li key={`${event.at}-${index}`} className="border-l border-border pl-4 text-sm">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{event.kind} · {event.at.slice(0, 16).replace("T", " ")}</div>
                  <div className="mt-1">{event.title}</div>
                  <div className="text-muted-foreground">{event.detail}</div>
                </li>
              ))}
              {!file.timeline.length ? <li className="text-sm text-muted-foreground">No history yet.</li> : null}
            </ol>
          </section>
          <form onSubmit={(event) => void saveNote(event)} className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-2xl">Notes</h2>
            <p className="mt-1 text-sm text-muted-foreground">Owner only. Clients never see this.</p>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} required rows={4} className="mt-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="What happened, and what you decided" />
            <Button type="submit" className="mt-3">Save note</Button>
            <ul className="mt-6 space-y-3 text-sm">
              {file.notes.map((item) => (
                <li key={item.id} className="rounded-lg border border-border p-3">
                  <div className="font-mono text-[10px] text-muted-foreground">{String(item.createdAt).slice(0, 16).replace("T", " ")}</div>
                  <p className="mt-1 whitespace-pre-wrap">{item.body}</p>
                </li>
              ))}
            </ul>
          </form>
        </>
      ) : null}
    </OwnerFrame>
  );
}

function label(sku: string): string {
  return catalogItem(sku)?.label ?? sku;
}
