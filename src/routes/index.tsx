import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { CATALOG, DRIVER_MONTHLY_CENTS, money } from "@/lib/billing/catalog";
import { canonical, DEFAULT_DESCRIPTION, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: pageTitle("Fleet program and hire screens") },
      { name: "description", content: DEFAULT_DESCRIPTION },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/") }],
  }),
  component: Home,
});

const steps = [
  ["01", "Request", "You name the person and the screen. SJCC takes the order only after it is paid."],
  ["02", "Schedule", "The person gets instructions. Collection is at a Quest or LabCorp site."],
  ["03", "Complete", "The collection happens on the testing partner's network. The sites are not ours."],
  ["04", "Review", "The laboratory and medical review officer finish their part. SJCC waits for the result."],
  ["05", "Report", "Status lands in your SJCC portal. You do not get a separate laboratory login."],
];

const faqs = [
  ["Which door is mine?", "A motor carrier with two or more testing drivers uses the fleet program. A staffing firm or office that only needs a pre-employment screen uses hire screens."],
  ["What does the $7 cover?", "The monthly seat for one testing driver in that company's own random pool. Drug tests, breath alcohol, and motor vehicle records are charged separately, before they are ordered."],
  ["Can a one-driver company join?", "No. A pool of one is not valid. You need a consortium. SJCC does not run one, and will not take random-program money from a single driver."],
  ["Where is the test collected?", "Quest and LabCorp sites, through our testing partner. SJCC does not own the clinics."],
];

function Home() {
  const drug = CATALOG.dot_drug;
  const alcohol = CATALOG.dot_alcohol;
  return (
    <PublicShell>
      <section className="relative overflow-hidden border-b border-border">
        <div className="grid-mission pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Southeast Michigan · two products</p>
          <h1 className="mt-5 max-w-4xl text-4xl sm:text-6xl">The compliance office for small fleets and local hiring.</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Flint, Genesee, and Oakland. Each fleet is its own random pool. Hire screens stay off that program. Tests are collected at Quest and LabCorp sites through our testing partner.
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <Link to="/fleets" className="border border-border bg-card p-5 hover:border-accent">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">I have a fleet</p>
              <p className="mt-3 text-2xl">2–20 testing drivers</p>
              <p className="mt-2 text-sm text-muted-foreground">{money(DRIVER_MONTHLY_CENTS)} per testing driver per month, plus prepaid tests.</p>
            </Link>
            <Link to="/hire" className="border border-border bg-card p-5 hover:border-accent">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">I need a hire screen</p>
              <p className="mt-3 text-2xl">Staffing and offices</p>
              <p className="mt-2 text-sm text-muted-foreground">No monthly seat. No random pool. Pay for the screen you order.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-px bg-border sm:grid-cols-3">
          {[
            ["Seat", money(DRIVER_MONTHLY_CENTS), "per testing driver / month"],
            ["DOT urine", money(drug.cents), "prepaid, before the order"],
            ["Breath alcohol", money(alcohol.cents), "a second order, not a bundle"],
          ].map(([label, price, detail]) => (
            <div key={label} className="bg-background px-4 py-6 sm:px-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
              <p className="mt-2 text-3xl text-accent tabular-nums">{price}</p>
              <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Services</p>
        <h2 className="mt-3 text-3xl">What the office actually does</h2>
        <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2">
          {[
            ["/fleets", "Fleet program", "Own pool. 50% drug, 10% alcohol. Minimum two testing drivers."],
            ["/hire", "Hire screens", "Pre-employment drug and background. No DOT seat."],
            ["/testing", "A test visit", "Paid on SJCC, collected at Quest or LabCorp, result in the portal."],
            ["/mvr", "Driving records", "Prepaid motor vehicle records. Not a date someone typed."],
          ].map(([to, title, body]) => (
            <Link key={to} to={to} className="bg-card p-6 hover:bg-muted">
              <h3 className="text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Process</p>
          <h2 className="mt-3 text-3xl">Request, then the result comes back here.</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-5">
            {steps.map(([step, label, detail]) => (
              <li key={step} className="border border-border p-4">
                <p className="font-mono text-[10px] text-accent">{step}</p>
                <p className="mt-3 text-lg">{label}</p>
                <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mt-12 border border-border p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">For the driver</p>
          <p className="mt-3 max-w-2xl text-lg text-foreground">If the company just told you to test, start there. Not with a filing checklist.</p>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">What to bring, why you cannot postpone a random draw, what the medical review officer call is, and what this office will not sell.</p>
          <Link to="/learn" className="mt-4 inline-block text-sm text-accent hover:underline">Read the driver notes</Link>
        </div>
        <div className="mt-12 border border-accent/40 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">One driver</p>
          <p className="mt-3 max-w-2xl text-lg">You need a consortium. We do not run a pool of one.</p>
          <p className="mt-2 text-sm text-muted-foreground">SJCC will not enroll a single testing driver in a random program. Order a one-off screen, or talk to us.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline"><Link to="/contact">Contact</Link></Button>
            <Button asChild variant="ghost"><Link to="/screen">Order a screen</Link></Button>
          </div>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {faqs.map(([q, a]) => (
            <article key={q}>
              <h3 className="text-lg">{q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Button asChild><Link to="/onboarding">Enroll</Link></Button>
          <Button asChild variant="outline"><Link to="/pricing">See pricing</Link></Button>
        </div>
      </section>
    </PublicShell>
  );
}
