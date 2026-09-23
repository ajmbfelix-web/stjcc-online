import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { OwnerFrame, ownerHeaders } from "@/components/owner-frame";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignInGate } from "@/lib/auth/gates";
import { CATALOG } from "@/lib/billing/catalog";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/owner/tests")({
  head: () => ({ meta: [{ title: pageTitle("Tests") }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <SignInGate><TestsPage /></SignInGate>,
});

type Order = { id: string; status: string; companyName: string; candidateName: string; sku: string; amountCents: number; channel: string; clearinghouse: string; resultEmail: string; resultSummary?: string | null };

function TestsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/owner/desk", { headers: ownerHeaders(), credentials: "include" });
    const json = (await response.json()) as { orders?: Order[]; error?: string };
    if (!response.ok) throw new Error(json.error ?? "Tests unavailable");
    setOrders(json.orders ?? []);
  }

  useEffect(() => { void load().catch((err) => setError(err instanceof Error ? err.message : "Tests unavailable")); }, []);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/owner/orders", {
      method: "POST",
      credentials: "include",
      headers: ownerHeaders(true),
      body: JSON.stringify({ companyName: form.get("companyName"), resultEmail: form.get("resultEmail"), candidateName: form.get("candidateName"), sku: form.get("sku"), channel: "walk_in" }),
    });
    const json = (await response.json()) as { url?: string | null; error?: string };
    if (!response.ok) { setError(json.error ?? "Could not create the order"); return; }
    setLink(json.url ?? "Recorded. Stripe is not configured in this environment, so no payment link was created.");
    await load();
  }

  async function act(id: string, body: Record<string, string>) {
    await fetch("/api/owner/orders", { method: "POST", credentials: "include", headers: ownerHeaders(true), body: JSON.stringify({ id, ...body }) });
    await load();
  }

  return (
    <OwnerFrame title="Tests." lede="A one-off company does not need a monthly seat. The card is charged before anything is sent to the lab. A non-negative client result waits here until you record the Clearinghouse decision.">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <form onSubmit={(event) => void create(event)} className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <input name="companyName" required placeholder="Company" className="h-11 rounded-md border border-border bg-background px-3" />
        <input name="resultEmail" type="email" required placeholder="Where the result goes" className="h-11 rounded-md border border-border bg-background px-3" />
        <input name="candidateName" required placeholder="Person tested" className="h-11 rounded-md border border-border bg-background px-3" />
        <select name="sku" className="h-11 rounded-md border border-border bg-background px-3">
          {Object.values(CATALOG).map((item) => <option key={item.sku} value={item.sku}>{item.label} — ${(item.cents / 100).toFixed(0)}</option>)}
        </select>
        <Button type="submit" className="sm:col-span-2 sm:w-fit">Create payment link</Button>
        {link ? <p className="text-sm text-muted-foreground sm:col-span-2 break-all">{link}</p> : null}
      </form>
      <div className="space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">{order.candidateName} · {order.companyName}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge tone={order.status === "unpaid" ? "warn" : order.clearinghouse === "awaiting_owner" ? "danger" : "idle"}>{order.status.replaceAll("_", " ")}</Badge>
                  <span>{order.sku} · {order.channel} · ${(order.amountCents / 100).toFixed(2)}</span>
                  {order.clearinghouse === "awaiting_owner" ? <Badge tone="danger">Your Clearinghouse decision</Badge> : null}
                  {order.clearinghouse === "recorded" ? <Badge tone="live">You recorded a report</Badge> : null}
                  {order.clearinghouse === "withheld" ? <Badge tone="idle">Not reported</Badge> : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {order.status !== "unpaid" && order.status !== "result" && order.status !== "exception" ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => void act(order.id, { action: "result", outcome: "cleared", summary: "Negative result recorded." })}>Clear</Button>
                    <Button size="sm" variant="outline" onClick={() => void act(order.id, { action: "result", outcome: "exception", summary: "Non-negative result. Owner decision required before any Clearinghouse report." })}>Non-negative</Button>
                    <Button size="sm" variant="outline" onClick={() => void act(order.id, { action: "result", outcome: "refusal", summary: "Refusal. The collection was not completed." })}>Refusal</Button>
                  </>
                ) : null}
                {order.clearinghouse === "awaiting_owner" ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => void act(order.id, { action: "result", outcome: "refusal", summary: "Refusal. The collection was not completed." })}>Mark refusal</Button>
                    <Button size="sm" onClick={() => void act(order.id, { action: "clearinghouse", decision: "recorded" })}>I reported this</Button>
                    <Button size="sm" variant="outline" onClick={() => void act(order.id, { action: "clearinghouse", decision: "withheld" })}>Do not report</Button>
                  </>
                ) : null}
              </div>
            </div>
          </article>
        ))}
        {!orders.length ? <p className="text-sm text-muted-foreground">No tests yet.</p> : null}
      </div>
    </OwnerFrame>
  );
}
