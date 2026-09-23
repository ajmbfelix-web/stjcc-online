import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AGREEMENT_ACKNOWLEDGMENTS, AGREEMENT_SECTIONS, AGREEMENT_TITLE, AGREEMENT_VERSION } from "@/lib/agreements/master";
import { getBearerToken } from "@/lib/auth/client";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: pageTitle("Client Onboarding") }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Onboarding,
});

const services = [
  "DOT drug and alcohol testing",
  "Random pool management",
  "MVR monitoring",
  "FMCSA Clearinghouse queries",
  "Driver qualification file",
  "Background screening",
];

function authHeaders(json = false): HeadersInit {
  const token = getBearerToken();
  return {
    ...(json ? { "content-type": "application/json" } : {}),
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

function Onboarding() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string; claimToken: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [returnedFromCheckout, setReturnedFromCheckout] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [readAgreement, setReadAgreement] = useState(false);
  const agreementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("complete") === "1") setReturnedFromCheckout(true);
    const stored = window.sessionStorage.getItem("sjcc-claim");
    if (stored) setClaimCode(stored);
  }, []);

  function markRead() {
    const frame = agreementRef.current;
    if (!frame) return;
    if (frame.scrollTop + frame.clientHeight >= frame.scrollHeight - 16) setReadAgreement(true);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!readAgreement) {
      setError("Scroll through the agreement before authorizing it.");
      return;
    }
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
      signerTitle: String(form.get("signerTitle") ?? ""),
      signatureName: String(form.get("signatureName") ?? ""),
      termsAccepted: form.get("termsAccepted") === "on",
      esignConsent: form.get("esignConsent") === "on",
      billingAuthorized: form.get("billingAuthorized") === "on",
      complianceAcknowledged: form.get("complianceAcknowledged") === "on",
      authorityConfirmed: form.get("authorityConfirmed") === "on",
    };
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        credentials: "include",
        headers: authHeaders(true),
        body: JSON.stringify(body),
      });
      const json = (await response.json()) as { onboardingId?: string; checkoutUrl?: string; claimToken?: string; error?: string };
      if (!response.ok || !json.onboardingId || !json.claimToken) throw new Error(json.error ?? "Onboarding failed");
      window.sessionStorage.setItem("sjcc-claim", json.claimToken);
      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
        return;
      }
      setDone({ id: json.onboardingId, claimToken: json.claimToken });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding failed");
    } finally {
      setBusy(false);
    }
  }

  async function claim(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClaimMessage(null);
    const response = await fetch("/api/onboarding/claim", {
      method: "POST",
      credentials: "include",
      headers: authHeaders(true),
      body: JSON.stringify({ token: claimCode }),
    });
    const json = (await response.json()) as { error?: string };
    setClaimMessage(response.ok ? "Organization linked. Continue to the portal." : json.error ?? "Claim failed");
  }

  if (done) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background px-4">
        <section className="w-full max-w-lg rounded-xl border border-border bg-card p-8">
          <Badge tone="ok">Setup recorded</Badge>
          <h1 className="mt-5 text-4xl">Activation continues on its own.</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            The signed agreement was emailed to you and to SJCC. Sign in with the contact email and enter this claim code if the account is not already linked. The workspace opens when billing confirms.
          </p>
          <p className="mt-5 font-mono text-xs text-muted-foreground">Reference {done.id}</p>
          <p className="mt-3 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm">{done.claimToken}</p>
          <Link to="/login" className="mt-7 inline-flex items-center gap-2 text-sm text-accent hover:underline">
            Sign in <ArrowRight className="size-4" />
          </Link>
        </section>
      </main>
    );
  }

  if (returnedFromCheckout) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background px-4">
        <section className="w-full max-w-lg rounded-xl border border-border bg-card p-8">
          <Badge tone="ok">Payment returned</Badge>
          <h1 className="mt-5 text-4xl">Stripe sent you back.</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            The organization becomes active when the signed billing webhook arrives. Sign in and use the claim code if you have not linked the account yet.
          </p>
          {claimCode ? <p className="mt-4 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm">{claimCode}</p> : null}
          <Link to="/login" className="mt-7 inline-flex items-center gap-2 text-sm text-accent hover:underline">
            Sign in <ArrowRight className="size-4" />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Wordmark compact />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Return home</Link>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Badge tone="live">Client onboarding</Badge>
        <h1 className="mt-5 max-w-2xl text-5xl">Start compliance without a setup call.</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Organization details, the service agreement, and the first month of testing seats are collected here. The workspace opens when payment confirms.
        </p>
        <form onSubmit={submit} className="mt-10 space-y-8">
          <section className="grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
            <Field name="organizationName" label="Legal business name" required />
            <Field name="dotNumber" label="DOT number" required />
            <Field name="contactName" label="Authorized representative" required />
            <Field name="contactEmail" label="Email address" type="email" required />
            <Field name="driverCount" label="Drivers who need testing" type="number" min="1" required />
            <p className="text-sm text-muted-foreground sm:col-span-2">
              $7 per driver per month, collected before the portal opens. A driver added later, beyond these seats, is charged $7 that day. One-off tests are charged before they are ordered: DOT drug $65, breath alcohol $55, both $110, MVR $15.
            </p>
          </section>
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-2xl">Services</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <label key={service} className="flex items-center gap-3 text-sm">
                  <input type="checkbox" name="services" value={service} className="size-4 accent-[var(--color-primary)]" />
                  {service}
                </label>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl">Agreement</h2>
                <p className="mt-2 text-sm text-muted-foreground">Version {AGREEMENT_VERSION}. Scroll to the end, then authorize.</p>
              </div>
              <Badge tone={readAgreement ? "ok" : "idle"}>{readAgreement ? "Read" : "Scroll"}</Badge>
            </div>
            <div
              ref={agreementRef}
              onScroll={markRead}
              className="mt-4 h-96 overflow-y-auto rounded-md border border-border bg-background px-5 py-5"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">St. Joseph Compliance Company</p>
              <h3 className="mt-2 text-xl">{AGREEMENT_TITLE}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Effective on the date this is signed. The signer’s name, title, email, IP address, time, and agreement version are stored with the signature. A signed PDF is emailed to the company and to SJCC.
              </p>
              <div className="mt-6 space-y-6">
                {AGREEMENT_SECTIONS.map((section) => (
                  <article key={section.heading}>
                    <h4 className="text-base">{section.heading}</h4>
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="mt-2 text-sm leading-relaxed text-muted-foreground">{paragraph}</p>
                    ))}
                    {section.bullets ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                        {section.bullets.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field name="signerTitle" label="Title" required />
              <Field name="signatureName" label="Electronic signature (type your full name)" required />
            </div>
            <div className="mt-5 space-y-4">
              {AGREEMENT_ACKNOWLEDGMENTS.map((item) => (
                <label key={item.name} className="flex items-start gap-3 text-sm">
                  <input required disabled={!readAgreement} type="checkbox" name={item.name} className="mt-0.5 size-4 accent-[var(--color-primary)] disabled:opacity-40" />
                  <span className={readAgreement ? "" : "text-muted-foreground"}>{item.label}</span>
                </label>
              ))}
            </div>
            {readAgreement ? null : <p className="mt-4 text-sm text-muted-foreground">The acknowledgments stay locked until the agreement has been scrolled to the end.</p>}
          </section>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={busy || !readAgreement}>
            {busy ? "Saving setup..." : "Sign and continue to payment"}
            <ArrowRight className="size-4" />
          </Button>
        </form>
        <form onSubmit={claim} className="mt-10 rounded-xl border border-border bg-card p-6">
          <h2 className="text-2xl">Already have a claim code?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in first, then link this account to the organization.</p>
          <label className="mt-4 block text-sm font-medium">
            Claim code
            <input value={claimCode} onChange={(event) => setClaimCode(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring/50" />
          </label>
          {claimMessage ? <p className="mt-3 text-sm text-muted-foreground">{claimMessage}</p> : null}
          <Button type="submit" variant="outline" className="mt-4">Link organization</Button>
        </form>
      </div>
    </main>
  );
}

function Field({ name, label, type = "text", min, required }: { name: string; label: string; type?: string; min?: string; required?: boolean }) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input name={name} type={type} min={min} required={required} className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 outline-none focus:ring-2 focus:ring-ring/50" />
    </label>
  );
}
