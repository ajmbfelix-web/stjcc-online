import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell, PageIntro } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import {
  ADDITIONAL_DRIVER_ANNUAL_CENTS,
  CATALOG,
  FLEET_ANNUAL_CENTS,
  FIRST_DRIVER_ANNUAL_CENTS,
  money,
  priceLabel,
} from "@/lib/billing/catalog";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: pageTitle("Pricing") },
      { name: "description", content: "SJCC fleet consortium is $299 per year. DOT urine is $73. Breath alcohol is $63. Tests are extra. Coming-soon services are not charged." },
    ],
    links: [{ rel: "canonical", href: canonical("/pricing") }],
  }),
  component: Pricing,
});

function Pricing() {
  const rows = Object.values(CATALOG);
  const live = rows.filter((item) => item.live);
  const soon = rows.filter((item) => !item.live);
  return (
    <PublicShell>
      <PageIntro
        eyebrow="Pricing"
        title="Membership is the year. Tests are extra."
        lede="The plan we sell is $299 per year for an accepted fleet, with unlimited testing drivers. Setup is $0. A one-driver company is not on this page."
        chips={["$299 fleet year", "$0 setup", "Coming soon is not a charge"]}
      />
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6">
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="soft-card relative overflow-hidden p-6 sm:p-8">
            <span className="absolute -right-4 -top-8 font-mono text-8xl text-muted">YR</span>
            <p className="relative font-mono text-xs uppercase tracking-widest text-accent">Fleet consortium</p>
            <p className="relative mt-4 text-6xl tabular-nums tracking-tight sm:text-7xl">{priceLabel(FLEET_ANNUAL_CENTS)}</p>
            <p className="relative mt-2 max-w-md text-sm text-muted-foreground">Per year. Unlimited testing drivers. Tests, records, and add-ons are not included.</p>
            <p className="relative mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Alternate quote for 2–8 testing drivers, on request and not the checkout: {money(FIRST_DRIVER_ANNUAL_CENTS)} for the first testing driver and {money(ADDITIONAL_DRIVER_ANNUAL_CENTS)} for each additional driver that year.
            </p>
            <Button asChild className="relative mt-6 rounded-full">
              <Link to="/onboarding/fleet">Start a fleet of two or more</Link>
            </Button>
          </article>
          <article className="rounded-[22px] border border-dashed border-border bg-muted/60 p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Not on this shelf</p>
            <p className="mt-4 text-4xl">One driver · $0</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A pool of one is refused before payment. The owner-operator page is a referral, and it discloses the possible fee.
            </p>
            <Button asChild variant="outline" className="mt-6 rounded-full bg-card">
              <Link to="/owner-operators">Read the stop</Link>
            </Button>
          </article>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-accent">Live</p>
              <h2 className="mt-2 text-3xl">Charged only after you order.</h2>
            </div>
            <Link to="/screen" className="text-sm underline decoration-accent decoration-2 underline-offset-4">Order screen</Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((item) => (
              <article key={item.sku} className="soft-card pop-card p-5">
                <p className="rounded-full bg-accent/20 px-2.5 py-1 text-xs font-medium w-fit">Live</p>
                <h3 className="mt-4 text-xl">{item.label}</h3>
                <p className="mt-3 text-4xl tabular-nums tracking-tight">{priceLabel(item.cents)}</p>
                {item.note ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.note}</p> : null}
              </article>
            ))}
          </div>
        </section>

        <section>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Coming soon</p>
          <h2 className="mt-2 text-3xl">Published, not payable.</h2>
          <div className="mt-6 overflow-x-auto rounded-[22px] border border-border bg-card">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-border bg-muted font-mono text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {soon.map((item) => (
                  <tr key={item.sku} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      {item.label}
                      {item.note ? <div className="mt-1 text-xs text-muted-foreground">{item.note}</div> : null}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{priceLabel(item.cents)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs">Coming soon</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
