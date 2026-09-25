import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell, PageIntro } from "@/components/public-shell";
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
  return (
    <PublicShell>
      <PageIntro
        eyebrow="Pricing"
        title="Membership is the year. Tests are extra."
        lede="The plan we sell is $299 per year for an accepted fleet, with unlimited testing drivers. Setup is $0. A one-driver company is not on this page."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        <section className="border border-border bg-card p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Fleet consortium</p>
          <p className="mt-3 text-4xl tabular-nums">{priceLabel(FLEET_ANNUAL_CENTS)}</p>
          <p className="mt-2 text-sm text-muted-foreground">Per year. Unlimited testing drivers. Tests, records, and add-ons are not included.</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Alternate quote for 2–8 testing drivers, on request and not the checkout: {money(FIRST_DRIVER_ANNUAL_CENTS)} for the first testing driver and {money(ADDITIONAL_DRIVER_ANNUAL_CENTS)} for each additional driver that year.
          </p>
          <Link to="/onboarding/fleet" className="mt-4 inline-block text-sm text-accent underline">
            Start a fleet of two or more
          </Link>
        </section>
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b border-border bg-muted font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.sku} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    {item.label}
                    {item.note ? <div className="mt-1 text-xs text-muted-foreground">{item.note}</div> : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{priceLabel(item.cents)}</td>
                  <td className="px-4 py-3">{item.live ? "Live" : "Coming soon"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          Coming soon means the page exists and the price is published. It is not a charge. Live drug, alcohol, same-visit, observed, and MVR orders are on <Link to="/screen" className="text-accent underline">the order screen</Link>.
        </p>
      </div>
    </PublicShell>
  );
}
