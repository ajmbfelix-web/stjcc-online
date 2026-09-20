import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Fingerprint,
  FlaskConical,
  QrCode,
  Radio,
  ShieldCheck,
  Webhook,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const capabilities = [
  {
    icon: Fingerprint,
    title: "Background Checks & MVRs",
    body: "Real-time driver background checks and motor vehicle records processing with structured exception handling for hiring and ongoing monitoring.",
  },
  {
    icon: FlaskConical,
    title: "Drug & Alcohol Testing",
    body: "DOT 5-Panel, non-DOT, urine, and breath alcohol testing via 10,000+ Quest Diagnostics and LabCorp collection sites.",
  },
  {
    icon: ShieldCheck,
    title: "Automated Consortium Management",
    body: "Cryptographically verifiable random pool administration and FMCSA Clearinghouse event tracking for C-TPA operations.",
  },
  {
    icon: QrCode,
    title: "Digital Clinic Passes",
    body: "Instant barcode pass generation delivered straight to driver phones via email and web — no paper chain-of-custody lag.",
  },
];

const pipeline = [
  { step: "01", label: "Dispatch", detail: "Digital order to LTS" },
  { step: "02", label: "Collect", detail: "Quest / LabCorp site" },
  { step: "03", label: "MRO", detail: "Result adjudication" },
  { step: "04", label: "Webhook", detail: "Signed callback ingest" },
  { step: "05", label: "Record", detail: "Fleet compliance state" },
];

const faqs = [
  {
    q: "What does St. Joseph Compliance Company do?",
    a: "SJCC automates DOT compliance for micro-fleets: background checks, MVRs, DOT 5-Panel and breath alcohol testing, consortium (C-TPA) random pools, FMCSA Clearinghouse events, and digital clinic passes.",
  },
  {
    q: "How does SJCC integrate with Lab Testing Solutions?",
    a: "Partners dispatch digital orders to our LTS order endpoint and receive MRO results on a signed webhook. HMAC verification uses LTS_WEBHOOK_SECRET.",
  },
  {
    q: "Which collection networks are supported?",
    a: "DOT 5-Panel, non-DOT, urine, and breath alcohol testing through 10,000+ Quest Diagnostics and LabCorp collection sites.",
  },
  {
    q: "What is a digital clinic pass?",
    a: "A barcode pass generated instantly and delivered to the driver by email or web so collection can start without paper delay.",
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
                Partner POC · Lab Testing Solutions
              </span>
            </div>
            <h1 className="mt-8 max-w-4xl text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Automated DOT Compliance & Screening Infrastructure
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Empowering micro-fleets with automated background checks, drug/alcohol
              screening, and digital C-TPA orchestration.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/dashboard">
                  Access Client Portal
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Request API Integration Access</Link>
              </Button>
            </div>
            <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
              {[
                ["10,000+", "Collection sites"],
                ["DOT 5-Panel", "Primary protocol"],
                ["HMAC", "Webhook verification"],
                ["stjcc.online", "Production host"],
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
            Platform architecture
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight">Capabilities</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Institutional screening stack built for fleets that need audit-ready
            operations without enterprise overhead.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {capabilities.map((item) => (
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
                  Vendor partner readiness
                </p>
                <h2 className="mt-3 max-w-xl text-3xl font-medium tracking-tight">
                  API-first orchestration for Lab Testing Solutions
                </h2>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                  Built to ingest LTS webhooks, dispatch digital orders, and handle
                  real-time MRO result updates. Endpoints are live on this POC for
                  sandbox pairing.
                </p>
              </div>
              <Radio className="hidden size-8 text-accent sm:block" strokeWidth={1.4} />
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

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-5">
                <div className="mb-3 flex items-center gap-2 text-sm">
                  <Webhook className="size-4 text-accent" />
                  POST /api/lts/order-test
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-muted-foreground">
{`{
  "partnerId": process.env.LTS_PARTNER_ID,
  "testType": "DOT_5_PANEL",
  "callbackUrl": "https://stjcc.online/api/lts/webhook"
}`}
                </pre>
              </div>
              <div className="rounded-xl border border-border bg-background p-5">
                <div className="mb-3 flex items-center gap-2 text-sm">
                  <ShieldCheck className="size-4 text-accent" />
                  POST /api/lts/webhook
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-muted-foreground">
{`{
  "event": "mro.result",
  "status": "NEGATIVE",
  "signature": "sha256 HMAC (LTS_WEBHOOK_SECRET)"
}`}
                </pre>
              </div>
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
      <SiteFooter />
    </div>
  );
}
