import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { DRIVER_MONTHLY_CENTS, money } from "@/lib/billing/catalog";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/fleets")({
  head: () => ({
    meta: [
      { title: pageTitle("Fleet program") },
      { name: "description", content: "SJCC fleet program for motor carriers with 2–20 testing drivers. Each company is its own random pool. $7 per testing driver per month." },
    ],
    links: [{ rel: "canonical", href: canonical("/fleets") }],
  }),
  component: Fleets,
});

function Fleets() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="Product · fleets"
        title="Your company. Your pool."
        lede="For motor carriers in Southeast Michigan with 2 to 20 testing drivers. SJCC runs that company's random selections at 50% drug and 10% alcohol. Nobody else's drivers are in it."
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl">What you get</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>{money(DRIVER_MONTHLY_CENTS)} per testing driver per month, collected up front.</li>
            <li>Random selections only from this roster, paced through the year.</li>
            <li>Prepaid DOT urine and breath alcohol. A visit that needs both is two orders.</li>
            <li>Prepaid motor vehicle records when you order them.</li>
            <li>A portal that is this company's file: roster, draws, orders, notices.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl">What you do not get</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>A shared pool with other SJCC clients.</li>
            <li>A program for one testing driver.</li>
            <li>Medical cards, qualification-file management, or authority filings.</li>
            <li>Clearinghouse filing. SJCC does not report to FMCSA for you.</li>
            <li>A laboratory login. Results stay in SJCC.</li>
          </ul>
        </div>
      </section>
      <section className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="max-w-xl text-sm text-muted-foreground">Minimum two testing drivers. Tests are extra, and they are charged before they are ordered.</p>
          <Button asChild><Link to="/onboarding/fleet">Enroll the fleet</Link></Button>
        </div>
      </section>
    </PublicShell>
  );
}
