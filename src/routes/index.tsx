import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { CATALOG, FLEET_ANNUAL_CENTS, money, priceLabel } from "@/lib/billing/catalog";
import { canonical, DEFAULT_DESCRIPTION, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: pageTitle("Fleet consortium and hire screens") },
      { name: "description", content: DEFAULT_DESCRIPTION },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/") }],
  }),
  component: Home,
});

const steps = [
  ["01", "Enroll", "A fleet of two or more pays the year. A hire screen skips membership. One driver is referred, not charged."],
  ["02", "Roster", "Your drivers sit on your company file. Accepted fleets join the single SJCC pool."],
  ["03", "Order", "A test is paid before it is sent. Coming-soon services stay on the page and off the card."],
  ["04", "Collect", "Quest and LabCorp, through our testing partner. More than 20,000 sites. None of them are ours."],
  ["05", "File", "The result returns to your portal. We do not file the Clearinghouse unless you designate us and that designation is accepted."],
];

const faqs = [
  ["What is the pool?", "Accepted fleets share one random pool at 50% drug and 10% alcohol. Your portal shows only your drivers and your selections."],
  ["What does $299 cover?", "A year of consortium membership for unlimited testing drivers: the pool, the private file, and a certificate after the roster is on file. Tests are extra."],
  ["Can one driver join?", "No. A pool of one is not valid. The owner-operator page is a referral, and it discloses that SJCC may receive a fee."],
  ["Who buys query credits?", "The employer, on the FMCSA Clearinghouse, at $1.25 each. We cannot buy them."],
];

function Home() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden border-b border-border">
        <div className="grid-paper pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Southeast Michigan · one consortium</p>
          <h1 className="mt-5 max-w-4xl text-4xl sm:text-6xl">The compliance file for fleets that actually share a pool.</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Flint, Genesee, and Oakland. Fleets of two or more join one SJCC consortium. Hire screens stay off it. A single testing driver is referred, not enrolled.
          </p>
          <div className="mt-10 grid gap-3 lg:grid-cols-3">
            <Link to="/consortium" className="border border-border bg-card p-5 hover:border-accent">
              <p className="font-mono text-xs uppercase tracking-widest text-accent">Fleet</p>
              <p className="mt-3 text-2xl">2 or more drivers</p>
              <p className="mt-2 text-sm text-muted-foreground">{money(FLEET_ANNUAL_CENTS)} per year. Unlimited testing drivers. Tests extra.</p>
            </Link>
            <Link to="/hire" className="border border-border bg-card p-5 hover:border-accent">
              <p className="font-mono text-xs uppercase tracking-widest text-accent">Hire screen</p>
              <p className="mt-3 text-2xl">Staffing and offices</p>
              <p className="mt-2 text-sm text-muted-foreground">Non-DOT panels for staffing. DOT only if the job is safety-sensitive.</p>
            </Link>
            <Link to="/owner-operators" className="border border-border bg-card p-5 hover:border-accent">
              <p className="font-mono text-xs uppercase tracking-widest text-accent">One driver</p>
              <p className="mt-3 text-2xl">Referral only</p>
              <p className="mt-2 text-sm text-muted-foreground">Not an SJCC product. No charge on this site.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Membership", priceLabel(FLEET_ANNUAL_CENTS), "per year · unlimited testing drivers"],
            ["DOT urine", priceLabel(CATALOG.dot_drug.cents), "any DOT reason"],
            ["Non-DOT 5-panel", priceLabel(CATALOG.nondot_urine_5.cents), "staffing and offices"],
            ["Breath alcohol", priceLabel(CATALOG.dot_alcohol.cents), "its own test, not a urine line"],
          ].map(([label, price, detail]) => (
            <div key={label} className="bg-background px-4 py-6 sm:px-6">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
              <p className="mt-2 text-3xl tabular-nums">{price}</p>
              <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Services</p>
        <h2 className="mt-3 text-3xl">Live where we can fulfill it. Marked when we cannot.</h2>
        <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2">
          {[
            ["/non-dot", "Non-DOT panels", "Live", "5-, 9-, and 10-panel urine, plus hair, for staffing and offices."],
            ["/testing", "DOT testing", "Live", "Urine, breath alcohol, same visit, and observed drug tests."],
            ["/randoms", "Random pool", "Live", "One combined hat for accepted fleets. Private files stay private."],
            ["/mvr", "Driving records", "Live", "From $19 plus the state fee. No invented 50-state table."],
            ["/clearinghouse", "Clearinghouse", "Coming soon", "Admin prices are published. Query credits stay with the employer."],
            ["/backgrounds", "Backgrounds", "Coming soon", "Basic, county, premium, and PSP. Contact, not a charge."],
            ["/physicals", "Physicals", "Coming soon", "A referral only. We do not perform the exam."],
            ["/filings", "BOC-3 and UCR", "Coming soon", "Quoted. Not filed from a checkout button."],
            ["/driver-files", "Qualification files", "Coming soon", "The portal roster is not a DQ file."],
          ].map(([to, title, badge, body]) => (
            <Link key={to} to={to} className="bg-card p-6 hover:bg-muted">
              <p className="font-mono text-xs uppercase tracking-widest text-accent">{badge}</p>
              <h3 className="mt-2 text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">How it works</p>
          <h2 className="mt-3 text-3xl">Five steps, and a hard stop at one driver.</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-5">
            {steps.map(([step, label, detail]) => (
              <li key={step} className="border border-border bg-card p-4">
                <p className="font-mono text-xs text-accent">{step}</p>
                <p className="mt-3 text-lg">{label}</p>
                <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2">
          {faqs.map(([q, a]) => (
            <article key={q}>
              <h3 className="text-lg">{q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link to="/onboarding/fleet">Enroll a fleet</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/pricing">See pricing</Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
