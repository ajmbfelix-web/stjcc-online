import { createFileRoute, Link } from "@tanstack/react-router";
import { H2, LearnArticle } from "@/components/learn-article";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/learn/limits")({
  head: () => ({
    meta: [
      { title: pageTitle("What SJCC does not do") },
      { name: "description", content: "SJCC does not sell consortium membership, Clearinghouse filing, DOT physicals, or a one-driver random program." },
    ],
    links: [{ rel: "canonical", href: canonical("/learn/limits") }],
  }),
  component: Page,
});

function Page() {
  return (
    <LearnArticle
      eyebrow="Limits"
      title="Some of what drivers are told to buy, we do not sell."
      lede="A complete motor carrier has more duties than a testing program. SJCC keeps the list short so a safety manager in Auburn Hills can see the edge of it."
    >
      <section>
        <H2>No consortium</H2>
        <p className="mt-3">A consortium puts many employers’ drivers into one random pool. That is a real way for a one-truck company to meet 49 CFR 382.305. It is not our product. If you have a single testing driver, you need that kind of pool somewhere else. <Link to="/contact" className="text-accent hover:underline">Call us</Link> if you are unsure which door you are in. We will not take the $7 seat.</p>
      </section>
      <section>
        <H2>No Clearinghouse filing</H2>
        <p className="mt-3">Employers register, query, and report in FMCSA’s Clearinghouse themselves. SJCC will not sell you a query, and we will not tell you we filed a violation. The portal can hold the employer’s own note about what they did. The note is not the filing.</p>
      </section>
      <section>
        <H2>No physicals, no qualification file, no authority paperwork</H2>
        <p className="mt-3">We do not schedule DOT medical exams, store a driver qualification file, file a BOC-3, register UCR, or stand up a new motor carrier. A medical-card date on a roster is a reminder the employer typed. It is not a clinic appointment and it is not a card we issued.</p>
      </section>
      <section>
        <H2>No shared SJCC pool</H2>
        <p className="mt-3">Fleets of two or more testing drivers are drawn separately. A result, a roster, and a note stay on that account. A hire-screen account is not drawn at all.</p>
      </section>
    </LearnArticle>
  );
}
