import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: pageTitle("Client Onboarding") }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Onboarding,
});

function Onboarding() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const body = {
      organizationName: String(form.get("organizationName") ?? ""),
      dotNumber: String(form.get("dotNumber") ?? ""),
      contactName: String(form.get("contactName") ?? ""),
      contactEmail: String(form.get("contactEmail") ?? ""),
      driverCount: Number(form.get("driverCount") ?? 0),
      services: form.getAll("services"),
      termsAccepted: form.get("termsAccepted") === "on",
      billingAuthorized: form.get("billingAuthorized") === "on",
      dataProcessingAccepted: form.get("dataProcessingAccepted") === "on",
    };
    try {
      const response = await fetch("/api/onboarding", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const json = (await response.json()) as { onboardingId?: string; checkoutUrl?: string; error?: string };
      if (!response.ok) throw new Error(json.error ?? "Onboarding failed");
      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
        return;
      }
      setDone(json.onboardingId ?? "submitted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding failed");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return <main className="grid min-h-dvh place-items-center bg-background px-4"><section className="w-full max-w-lg rounded-xl border border-border bg-card p-8"><Badge tone="ok">Application received</Badge><h1 className="mt-5 text-4xl">Your setup is underway.</h1><p className="mt-4 text-sm leading-relaxed text-muted-foreground">SJCC recorded your organization details and agreement acceptance. The next step is payment setup and owner review.</p><p className="mt-5 font-mono text-xs text-muted-foreground">Reference: {done}</p><Link to="/" className="mt-7 inline-flex items-center gap-2 text-sm text-accent hover:underline">Return to site <ArrowRight className="size-4" /></Link></section></main>;
  }

  return <main className="min-h-dvh bg-background"><header className="border-b border-border"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6"><Wordmark compact /><Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Return home</Link></div></header><div className="mx-auto max-w-3xl px-4 py-12 sm:px-6"><Badge tone="live">Client onboarding</Badge><h1 className="mt-5 max-w-2xl text-5xl">Make compliance easier to run.</h1><p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">Tell us about your organization and services. Your information is saved as a secure setup request so you can complete the process without repeating work.</p><form onSubmit={submit} className="mt-10 space-y-8"><section className="grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2"><Field name="organizationName" label="Legal business name" required /><Field name="dotNumber" label="DOT number" required /><Field name="contactName" label="Primary contact" required /><Field name="contactEmail" label="Contact email" type="email" required /><Field name="driverCount" label="Active drivers" type="number" min="0" required /></section><section className="rounded-xl border border-border bg-card p-6"><h2 className="text-2xl">Services</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{["DOT drug and alcohol testing", "MVR monitoring", "Background screening", "Random pool management"].map((service) => <label key={service} className="flex items-center gap-3 text-sm"><input type="checkbox" name="services" value={service} className="size-4 accent-[var(--color-primary)]" />{service}</label>)}</div></section><section className="rounded-xl border border-border bg-card p-6"><h2 className="text-2xl">Agreement and billing authorization</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">This prototype records which terms and authorizations you accepted. Replace the placeholder agreement text with counsel-approved terms before production use.</p><div className="mt-5 space-y-4">{[["termsAccepted", "I agree to the SJCC terms of service."], ["billingAuthorized", "I authorize recurring payment setup through Stripe."], ["dataProcessingAccepted", "I authorize SJCC to process compliance information for these services."]].map(([name, label]) => <label key={name} className="flex items-start gap-3 text-sm"><input required type="checkbox" name={name} className="mt-0.5 size-4 accent-[var(--color-primary)]" /><span>{label}</span></label>)}</div></section>{error && <p className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={busy}>{busy ? "Saving setup..." : "Submit onboarding"}<ArrowRight className="size-4" /></Button></form></div></main>;
}

function Field({ name, label, type = "text", min, required }: { name: string; label: string; type?: string; min?: string; required?: boolean }) { return <label className="text-sm font-medium">{label}<input name={name} type={type} min={min} required={required} className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 outline-none focus:ring-2 focus:ring-ring/50" /></label>; }