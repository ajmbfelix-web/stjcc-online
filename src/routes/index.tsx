import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardCheck, FileCheck2, FlaskConical, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ProductShowcase } from "@/components/product-showcase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATALOG, DRIVER_MONTHLY_CENTS, money } from "@/lib/billing/catalog";
import { canonical, DEFAULT_DESCRIPTION, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: pageTitle("Automated DOT Compliance & Screening") },
      { name: "description", content: DEFAULT_DESCRIPTION },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/") }],
  }),
  component: Home,
});

const services = [
  {
    icon: FlaskConical,
    title: "Drug and alcohol testing",
    body: "5-, 9-, and 10-panel urine testing, hair follicle testing, breath alcohol testing, and DOT-regulated panels through a SAMHSA-certified lab network.",
  },
  {
    icon: FileCheck2,
    title: "Background screening",
    body: "National and county-level criminal searches, sex offender registry checks, SSN trace, and employment and education verification.",
  },
  {
    icon: ClipboardCheck,
    title: "Motor vehicle records",
    body: "Real-time MVR access to help employers review driving history during hiring and ongoing compliance checks.",
  },
  {
    icon: ShieldCheck,
    title: "Consortium and CDL compliance",
    body: "Full consortium management, random pool administration, and CDL Clearinghouse queries for DOT-regulated employers.",
  },
];

const pipeline = [
  { step: "01", label: "Request", detail: "We confirm the service needed" },
  { step: "02", label: "Schedule", detail: "The driver receives instructions" },
  { step: "03", label: "Complete", detail: "Testing or screening is performed" },
  { step: "04", label: "Review", detail: "Results are checked and documented" },
  { step: "05", label: "Report", detail: "The employer receives a clear status" },
];

const faqs = [
  {
    q: "What does St. Joseph Compliance Company do?",
    a: "SJCC coordinates drug and alcohol testing, background screening, motor vehicle records, consortium management, random pools, and CDL Clearinghouse queries for employers.",
  },
  {
    q: "How does SJCC manage compliance work?",
    a: "We coordinate the request, collection or search, review, and reporting steps so employers have a documented compliance record without managing each vendor separately.",
  },
  {
    q: "Which services does SJCC provide?",
    a: "Services include 5-, 9-, and 10-panel urine testing, hair follicle testing, breath alcohol testing, DOT-regulated panels, background screening, and MVRs.",
  },
  {
    q: "What is a digital clinic pass?",
    a: "We provide clear instructions and scheduling details so the driver knows where to go and the employer can track completion.",
  },
];

function Home() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="grid-mission pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="live">Systems online</Badge>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Employer compliance services
              </span>
            </div>
            <h1 className="mt-8 max-w-4xl text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Straightforward compliance support for employers and fleets
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Our proprietary compliance engine manages testing, screening, real-time MVR
              checks, random pools, and digital clinic passes for DOT-ready operations.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/contact">
                  Request a consultation
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Talk with SJCC</Link>
              </Button>
            </div>
            <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
              {[
                ["5 / 9 / 10", "Urine panels"],
                ["DOT", "Regulated testing"],
                ["MVR", "Real-time records"],
                ["CDL", "Clearinghouse queries"],
              ].map(([k, v]) => (
                <div key={v} className="bg-card px-4 py-5">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {v}
                  </dt>
                  <dd className="mt-2 text-lg font-medium tabular-nums">{k}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="capabilities" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            Services
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight">The services employers need</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A single point of coordination for screening, testing, and DOT compliance work.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {services.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <item.icon className="size-5 text-accent" strokeWidth={1.6} />
                <h3 className="mt-4 text-lg font-medium">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="architecture" className="border-y border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
                  How the process works
                </p>
                <h2 className="mt-3 max-w-xl text-3xl font-medium tracking-tight">
                  A clear workflow from request to report
                </h2>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                  We handle the operational steps behind the scenes. Employers see the
                  service status and final documentation they need, while sensitive
                  records remain restricted to authorized SJCC staff.
                </p>
              </div>
              <ShieldCheck className="hidden size-8 text-accent sm:block" strokeWidth={1.4} />
            </div>

            <ol className="mt-12 grid gap-3 sm:grid-cols-2 md:grid-cols-5">
              {pipeline.map((node, i) => (
                <li
                  key={node.step}
                  className="relative rounded-lg border border-border bg-background px-4 py-4"
                >
                  <span className="font-mono text-[10px] text-subtle">{node.step}</span>
                  <div className="mt-2 text-sm font-medium">{node.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{node.detail}</div>
                  {i < pipeline.length - 1 ? (
                    <span className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-subtle md:block">
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>

          </div>
        </section>

        <ProductShowcase />

        <section id="pricing" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Pricing</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">Pay before the test is ordered.</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              A full program is {money(DRIVER_MONTHLY_CENTS)} per testing driver each month, collected up front. One-off and staffing tests are a separate charge, taken before anything is sent to a clinic.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <article className="rounded-xl border border-primary bg-card p-5 lg:col-span-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Program</p>
                <p className="mt-3 text-3xl tabular-nums">{money(DRIVER_MONTHLY_CENTS)}</p>
                <p className="mt-2 text-sm text-muted-foreground">Per testing driver, each month. Random pool included.</p>
              </article>
              {Object.values(CATALOG).map((item) => (
                <article key={item.sku} className="rounded-xl border border-border bg-card p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                  <p className="mt-3 text-3xl tabular-nums">{money(item.cents).replace(".00", "")}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Charged before the order.</p>
                </article>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link to="/onboarding">Start a fleet program<ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/screen">Order one test</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">FAQ</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight">
            About SJCC DOT compliance
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <article key={item.q} className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-base font-medium">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <section className="border-t border-border bg-card/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">SJCC operations</p>
            <h2 className="mt-2 text-2xl">Business owner access</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Review client onboarding, agreements, billing readiness, and audit exports.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/owner">
              Owner sign-in
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
