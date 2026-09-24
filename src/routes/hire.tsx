import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/hire")({
  head: () => ({
    meta: [
      { title: pageTitle("Hire screens") },
      { name: "description", content: "Prepaid drug screens and background checks for staffing firms and offices. No random pool and no monthly DOT seat." },
    ],
    links: [{ rel: "canonical", href: canonical("/hire") }],
  }),
  component: Hire,
});

function Hire() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="Product · hire screens"
        title="A screen before day one."
        lede="For staffing firms and offices that need a pre-employment drug screen, a background, or both. This is not a DOT random program."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <ul className="grid gap-4 sm:grid-cols-3">
          {[
            ["No seat", "There is no $7 monthly charge and no testing-driver count."],
            ["No randoms", "SJCC will not draw this account. There is no pool."],
            ["Prepaid only", "Each screen is paid before it is ordered. The catalog price is the price."],
          ].map(([title, body]) => (
            <li key={title} className="border border-border p-5">
              <h2 className="text-xl">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
          Collection, when the product is a drug test, is at Quest and LabCorp sites through our testing partner. The result is in the SJCC portal, sent to the company email you name.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild><Link to="/onboarding/hire">Open a hire account</Link></Button>
          <Button asChild variant="outline"><Link to="/screen">Order one screen</Link></Button>
        </div>
      </section>
    </PublicShell>
  );
}
