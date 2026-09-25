import { createFileRoute, Link } from "@tanstack/react-router";
import { H2, LearnArticle } from "@/components/learn-article";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/learn/random-pool")({
  head: () => ({
    meta: [
      { title: pageTitle("How a random pool works") },
      { name: "description", content: "SJCC draws one consortium at the FMCSA 50% drug and 10% alcohol rates. A one-driver company is not enrolled." },
    ],
    links: [{ rel: "canonical", href: canonical("/learn/random-pool") }],
  }),
  component: Page,
});

function Page() {
  return (
    <LearnArticle
      eyebrow="Random testing"
      title="The consortium is the pool."
      lede="FMCSA requires random drug and alcohol testing of drivers who perform safety-sensitive work. SJCC runs that draw on one combined pool. Each company's portal still lists only its own drivers."
    >
      <section>
        <H2>The rates</H2>
        <p className="mt-3">Under 49 CFR 382.305, the minimum annual random rate is 50 percent of driver positions for controlled substances and 10 percent for alcohol. The U.S. Department of Transportation left those FMCSA rates unchanged for 2026. The drug rate has been 50 percent since 2020. Fifty percent is a count of tests across the year, not a coin flip that half the drivers fail.</p>
        <p className="mt-3">SJCC spreads selections through the year. The annual count is taken from the combined consortium. A selection is stored on the driver's company, so another carrier's name never appears in your file.</p>
      </section>
      <section>
        <H2>Who can be drawn</H2>
        <p className="mt-3">Drivers the employer has placed in the testing program. The selection is not the safety manager picking a name because a truck was late. Every covered driver is in the same draw.</p>
        <p className="mt-3">A company with one testing driver is not added. That operator is referred, not sold a membership. Read the <Link to="/owner-operators" className="text-accent hover:underline">owner-operator page</Link>.</p>
      </section>
      <section>
        <H2>What the employer still does</H2>
        <p className="mt-3">Keep the roster current. A driver who quit should come off. A new driver who needs testing should go on, after any pre-employment test the rule requires. SJCC cannot draw a person the company never listed, and it should not keep drawing a person who is gone.</p>
        <p className="mt-3">Membership is $299 per year for unlimited testing drivers. The test itself is a separate prepaid charge. The year is the program. The test is the event.</p>
      </section>
    </LearnArticle>
  );
}
