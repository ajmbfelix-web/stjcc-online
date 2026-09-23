import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { CATALOG } from "@/lib/billing/catalog";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/screen")({
  head: () => ({ meta: [{ title: pageTitle("Order a drug test") }, { name: "description", content: "Pay for a DOT drug test. The result goes to the staffing company or employer you name." }] }),
  component: Screen,
});

function Screen() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(false);
  useEffect(() => {
    setPaid(new URLSearchParams(window.location.search).get("paid") === "1");
  }, []);
  if (paid) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background px-4">
        <section className="max-w-lg rounded-xl border border-border bg-card p-8">
          <Wordmark compact />
          <h1 className="mt-6 text-4xl">Payment received.</h1>
          <p className="mt-4 text-sm text-muted-foreground">The test is not sent to a clinic until the laboratory accepts it. The result goes to the company email you entered.</p>
          <Link to="/" className="mt-6 inline-block text-sm text-accent hover:underline">Return home</Link>
        </section>
      </main>
    );
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/screen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        candidateName: form.get("candidateName"),
        candidateEmail: form.get("candidateEmail"),
        companyName: form.get("companyName"),
        resultEmail: form.get("resultEmail"),
        sku: form.get("sku"),
      }),
    });
    const json = (await response.json()) as { url?: string | null; error?: string };
    if (!response.ok || !json.url) {
      setError(json.error ?? "Payment could not be started");
      setBusy(false);
      return;
    }
    window.location.href = json.url;
  }
  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4"><Wordmark compact /><Link to="/" className="text-sm text-muted-foreground">Home</Link></div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Staffing and one-off screens</p>
        <h1 className="mt-4 text-5xl">Order the test. Pay first.</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">A recruiter can send a candidate here. The result is emailed to the staffing company. A full compliance program, with the random pool, is separate and billed at $7 per testing driver per month.</p>
        <form onSubmit={(event) => void submit(event)} className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-6">
          <label className="text-sm">Your name<input name="candidateName" required className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3" /></label>
          <label className="text-sm">Your email<input name="candidateEmail" type="email" required className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3" /></label>
          <label className="text-sm">Staffing company or employer<input name="companyName" required className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3" /></label>
          <label className="text-sm">Email that should receive the result<input name="resultEmail" type="email" required className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3" /></label>
          <label className="text-sm">Test
            <select name="sku" className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3">
              {Object.values(CATALOG).map((item) => <option key={item.sku} value={item.sku}>{item.label} — ${(item.cents / 100).toFixed(0)}</option>)}
            </select>
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={busy}>{busy ? "Starting payment..." : "Pay and order"}</Button>
        </form>
      </div>
    </main>
  );
}
