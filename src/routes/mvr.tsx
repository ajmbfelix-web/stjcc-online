import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, PublicShell } from "@/components/public-shell";
import { CATALOG, money } from "@/lib/billing/catalog";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/mvr")({
  head: () => ({
    meta: [
      { title: pageTitle("Motor vehicle records") },
      { name: "description", content: "Prepaid driving-record orders through SJCC. A motor vehicle record is not a date typed on a roster." },
    ],
    links: [{ rel: "canonical", href: canonical("/mvr") }],
  }),
  component: Mvr,
});

function Mvr() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="Motor vehicle records"
        title="A record you ordered. Not a date you typed."
        lede={`A motor vehicle record is ${money(CATALOG.mvr.cents)}, paid before SJCC places it. The roster date field is a reminder. It is not the product.`}
      />
      <section className="mx-auto max-w-3xl px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6">
        <p>Fleets on the monthly program can order records for drivers they already track. Staffing accounts and one-off buyers use the same price on the hire-screen catalog.</p>
        <p className="mt-4">SJCC does not pull a record by writing a review date into the file.</p>
        <Link to="/pricing" className="mt-6 inline-block text-accent hover:underline">Full price list</Link>
      </section>
    </PublicShell>
  );
}
