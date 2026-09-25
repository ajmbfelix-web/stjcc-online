import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AGREEMENT_TITLE, AGREEMENT_VERSION, agreementAcknowledgments, agreementSections } from "@/lib/agreements/master";
import { ONBOARDING_SERVICES } from "@/lib/billing/lts-catalog";
import { FLEET_ANNUAL_CENTS, money } from "@/lib/billing/catalog";
import { getBearerToken } from "@/lib/auth/client";
import { refuseFleetSeats } from "@/lib/portal/programs";

function authHeaders(json = false): HeadersInit {
  const token = getBearerToken();
  return {
    ...(json ? { "content-type": "application/json" } : {}),
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

export function EnrollForm({ program }: { program: "fleet" | "hire" }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string; claimToken: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [returnedFromCheckout, setReturnedFromCheckout] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [readAgreement, setReadAgreement] = useState(false);
  const [driverCount, setDriverCount] = useState(program === "fleet" ? 2 : 0);
  const agreementRef = useRef<HTMLDivElement>(null);
  const seatBlock = program === "fleet" ? refuseFleetSeats(driverCount) : null;
  const services = ONBOARDING_SERVICES.filter((service) => (program === "hire" ? service.id !== "dot_testing" : true));
  const sections = agreementSections(program);
  const acknowledgments = agreementAcknowledgments(program);

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
    if (seatBlock) {
      setError(seatBlock);
      return;
    }
    if (!readAgreement) {
      setError("Scroll through the agreement before authorizing it.");
      return;
    }
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const body = {
      program,
      organizationName: String(form.get("organizationName") ?? ""),
      dotNumber: String(form.get("dotNumber") ?? ""),
      contactName: String(form.get("contactName") ?? ""),
      contactEmail: String(form.get("contactEmail") ?? ""),
      driverCount: program === "fleet" ? driverCount : 0,
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
      <StatusShell
        badge="Setup recorded"
        title={program === "hire" ? "The hire screen is open." : "Activation continues on its own."}
        body={
          program === "hire"
            ? "Sign in with the contact email. Use the claim code if the account is not already linked. Order screens from the portal. There is no monthly seat."
            : "The signed agreement was emailed to you and to SJCC. The workspace opens when the first month of seats confirms."
        }
        extra={<p className="mt-3 border border-border px-3 py-2 font-mono text-sm">{done.claimToken}</p>}
      />
    );
  }

  if (returnedFromCheckout) {
    return (
      <StatusShell
        badge="Payment returned"
        title="Stripe sent you back."
        body="The organization becomes active when billing confirms. Sign in and use the claim code if the account is not linked yet."
        extra={claimCode ? <p className="mt-4 border border-border px-3 py-2 font-mono text-sm">{claimCode}</p> : null}
      />
    );
  }

  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Wordmark compact />
          <Link to="/onboarding" className="text-sm text-muted-foreground hover:text-foreground">
            Both products
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Badge tone="live">{program === "fleet" ? "Fleet program" : "Hire screen"}</Badge>
        <h1 className="mt-5 max-w-2xl text-4xl sm:text-5xl">
          {program === "fleet" ? "Enroll a fleet of two or more." : "Open a hire-screen account."}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {program === "fleet"
            ? `${money(FLEET_ANNUAL_CENTS)} per year for unlimited testing drivers. Tests are extra and prepaid. A one-driver company cannot buy this program.`
            : "No consortium membership and no random pool. You pay only when you order a live screen."}
        </p>
        <form onSubmit={submit} className="mt-10 space-y-8">
          <section className="grid gap-4 border border-border bg-card p-6 sm:grid-cols-2">
            <Field name="organizationName" label={program === "fleet" ? "Legal business name" : "Company"} required />
            <Field name="dotNumber" label={program === "fleet" ? "DOT number" : "DOT number, if you have one"} required={program === "fleet"} />
            <Field name="contactName" label="Authorized representative" required />
            <Field name="contactEmail" label="Email address" type="email" required />
            {program === "fleet" ? (
              <label className="text-sm font-medium sm:col-span-2">
                Testing drivers
                <input
                  name="driverCount"
                  type="number"
                  min={1}
                  value={driverCount}
                  onChange={(event) => setDriverCount(Number(event.target.value))}
                  required
                  className="mt-1 h-11 w-full border border-border bg-background px-3 outline-none focus:ring-2 focus:ring-ring/50"
                />
              </label>
            ) : null}
            {seatBlock ? (
              <div className="border border-accent/50 bg-background p-4 text-sm sm:col-span-2">
                <p className="font-medium text-accent">This program stops here.</p>
                <p className="mt-2 text-muted-foreground">{seatBlock}</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link to="/screen" className="text-accent hover:underline">
                    Order a hire screen
                  </Link>
                  <Link to="/contact" className="text-accent hover:underline">
                    Contact SJCC
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground sm:col-span-2">
                {program === "fleet"
                  ? "DOT urine and breath alcohol are two orders. A motor vehicle record is separate. Collection is at Quest and LabCorp sites through our testing partner."
                  : "Screens use the published catalog. Results come back to this account. SJCC does not file Clearinghouse reports."}
              </p>
            )}
          </section>
          {seatBlock ? null : (
            <>
              <section className="border border-border bg-card p-6">
                <h2 className="text-2xl">{program === "fleet" ? "What this fleet runs" : "What you can order"}</h2>
                <div className="mt-4 grid gap-3">
                  {services.map((service) => (
                    <label key={service.id} className="flex items-start gap-3 text-sm">
                      <input
                        type="checkbox"
                        name="services"
                        value={service.id}
                        defaultChecked={program === "fleet" ? service.id === "dot_testing" : service.id === "nondot_testing" || service.id === "background"}
                        className="mt-1 size-4 accent-[var(--color-primary)]"
                      />
                      <span>
                        <span className="font-medium">{service.label}</span>
                        <span className="mt-1 block text-muted-foreground">{service.detail}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
              <section className="border border-border bg-card p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl">Agreement</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Version {AGREEMENT_VERSION}. Scroll to the end, then authorize.</p>
                  </div>
                  <Badge tone={readAgreement ? "ok" : "idle"}>{readAgreement ? "Read" : "Scroll"}</Badge>
                </div>
                <div ref={agreementRef} onScroll={markRead} className="mt-4 h-96 overflow-y-auto border border-border bg-background px-5 py-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">St. Joseph Compliance Company</p>
                  <h3 className="mt-2 text-xl">{AGREEMENT_TITLE}</h3>
                  <div className="mt-6 space-y-6">
                    {sections.map((section) => (
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
                  {acknowledgments.map((item) => (
                    <label key={item.name} className="flex items-start gap-3 text-sm">
                      <input required disabled={!readAgreement} type="checkbox" name={item.name} className="mt-0.5 size-4 accent-[var(--color-primary)] disabled:opacity-40" />
                      <span className={readAgreement ? "" : "text-muted-foreground"}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </section>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={busy || !readAgreement}>
                {busy ? "Saving..." : program === "fleet" ? "Sign and pay the first month" : "Sign and open the account"}
                <ArrowRight className="size-4" />
              </Button>
            </>
          )}
        </form>
        <form onSubmit={claim} className="mt-10 border border-border bg-card p-6">
          <h2 className="text-2xl">Already have a claim code?</h2>
          <label className="mt-4 block text-sm font-medium">
            Claim code
            <input value={claimCode} onChange={(event) => setClaimCode(event.target.value)} className="mt-1 h-11 w-full border border-border bg-background px-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring/50" />
          </label>
          {claimMessage ? <p className="mt-3 text-sm text-muted-foreground">{claimMessage}</p> : null}
          <Button type="submit" variant="outline" className="mt-4">Link organization</Button>
        </form>
      </div>
    </main>
  );
}

function StatusShell({ badge, title, body, extra }: { badge: string; title: string; body: string; extra?: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <section className="w-full max-w-lg border border-border bg-card p-8">
        <Badge tone="ok">{badge}</Badge>
        <h1 className="mt-5 text-4xl">{title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{body}</p>
        {extra}
        <Link to="/login" className="mt-7 inline-flex items-center gap-2 text-sm text-accent hover:underline">
          Sign in <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input name={name} type={type} required={required} className="mt-1 h-11 w-full border border-border bg-background px-3 outline-none focus:ring-2 focus:ring-ring/50" />
    </label>
  );
}
