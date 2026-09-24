import { createFileRoute, Link } from "@tanstack/react-router";
import { H2, LearnArticle } from "@/components/learn-article";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/learn/screens")({
  head: () => ({
    meta: [
      { title: pageTitle("Hire screens") },
      { name: "description", content: "What a staffing firm can order before day one: drug screens and the background products on the SJCC catalog." },
    ],
    links: [{ rel: "canonical", href: canonical("/learn/screens") }],
  }),
  component: Page,
});

function Page() {
  return (
    <LearnArticle
      eyebrow="Hiring"
      title="A screen is not a random program."
      lede="Staffing firms and offices use this when they need to know something before a person starts. There is no monthly seat and no draw."
    >
      <section>
        <H2>Drug screen</H2>
        <p className="mt-3">A pre-employment urine test, DOT or non-DOT, depending on the job. DOT panels are for drivers who will do FMCSA safety-sensitive work. A warehouse hire or an office hire is usually not that test. The catalog separates them so the wrong panel is not ordered by accident. Collection, when it is a drug test, is still at a Quest or LabCorp site through our testing partner.</p>
        <p className="mt-3">Hair testing is on the catalog as its own item. It is not a substitute name for a DOT urine test.</p>
      </section>
      <section>
        <H2>Background</H2>
        <p className="mt-3">The catalog includes a national criminal search, a county criminal search, a sex-offender registry check, an SSN trace, employment verification, and education verification. You order the ones the job needs. You do not get a bundle of products SJCC does not list.</p>
        <p className="mt-3">The hiring company receives the result. The person being screened does not get an SJCC portal full of other people’s files.</p>
      </section>
      <section>
        <H2>How to start</H2>
        <p className="mt-3">Open a <Link to="/onboarding/hire" className="text-accent hover:underline">hire account</Link> if you will order more than once. Use <Link to="/screen" className="text-accent hover:underline">order a screen</Link> for a single prepaid order. Either way the charge happens before the order is placed.</p>
      </section>
    </LearnArticle>
  );
}
