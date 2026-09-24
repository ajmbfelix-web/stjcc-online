import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, PublicShell } from "@/components/public-shell";
import { CATALOG, DRIVER_MONTHLY_CENTS, money } from "@/lib/billing/catalog";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: pageTitle("Pricing") },
      { name: "description", content: "SJCC fleet seats are $7 per testing driver per month. Hire screens pay catalog prices only. Tests are prepaid." },
    ],
    links: [{ rel: "canonical", href: canonical("/pricing") }],
  }),
  component: Pricing,
});

function Pricing() {
  const items = Object.values(CATALOG);
  return (
    <PublicShell>
      <PageIntro
        eyebrow="Pricing"
        title="Two columns. No third product."
        lede="Fleet seats are monthly. Every test and screen on either product is prepaid. Prices below are the catalog. They are not estimates."
      />
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2">
        <article className="border border-border p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Fleet program</p>
          <p className="mt-4 text-4xl text-accent tabular-nums">{money(DRIVER_MONTHLY_CENTS)}</p>
          <p className="mt-1 text-sm text-muted-foreground">per testing driver per month, collected up front. Minimum two.</p>
          <p className="mt-4 text-sm text-muted-foreground">Plus the catalog below when a test, screen, or record is ordered.</p>
          <Link to="/onboarding/fleet" className="mt-6 inline-block text-sm text-accent hover:underline">Enroll a fleet</Link>
        </article>
        <article className="border border-border p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Hire screen</p>
          <p className="mt-4 text-4xl">No seat</p>
          <p className="mt-1 text-sm text-muted-foreground">No monthly charge. No random pool. Catalog prices only.</p>
          <p className="mt-4 text-sm text-muted-foreground">A drug test and a breath alcohol test are two charges.</p>
          <Link to="/onboarding/hire" className="mt-6 inline-block text-sm text-accent hover:underline">Open a hire account</Link>
        </article>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="text-2xl">Catalog</h2>
        <div className="mt-4 overflow-x-auto border border-border">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-border font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">DOT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.sku} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{item.label}</td>
                  <td className="px-4 py-3 tabular-nums text-accent">{money(item.cents)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.dot ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          One testing driver is not sold as a program. <Link to="/contact" className="text-accent hover:underline">Contact SJCC</Link>.
        </p>
      </section>
    </PublicShell>
  );
}
