import { createFileRoute, Link } from "@tanstack/react-router";
import { H2, LearnArticle } from "@/components/learn-article";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/learn/limits")({
  head: () => ({
    meta: [
      { title: pageTitle("What SJCC does not do") },
      { name: "description", content: "SJCC does not enroll a one-driver carrier, does not perform DOT physicals, and does not file Clearinghouse reports unless designated." },
    ],
    links: [{ rel: "canonical", href: canonical("/learn/limits") }],
  }),
  component: Page,
});

function Page() {
  return (
    <LearnArticle
      eyebrow="Limits"
      title="The edge of what this office sells."
      lede="The consortium is for fleets of two or more. Several neighboring products are explained on the site and are not charged."
    >
      <section>
        <H2>No pool of one</H2>
        <p className="mt-3">A single testing driver is not placed in the SJCC consortium and is not charged. The <Link to="/owner-operators" className="text-accent hover:underline">owner-operator page</Link> is a referral, with a disclosure that SJCC may receive a fee if that carrier enrolls through the link.</p>
      </section>
      <section>
        <H2>No Clearinghouse filing</H2>
        <p className="mt-3">Employers register in FMCSA’s Clearinghouse themselves and buy query credits there, at $1.25 each. SJCC does not buy those credits. Assisted setup and query administration are priced and marked coming soon. We do not tell you a violation was filed unless a designation is accepted in the federal system.</p>
      </section>
      <section>
        <H2>No physicals, no qualification file, no authority paperwork</H2>
        <p className="mt-3">We do not perform DOT medical exams. A physical referral, a qualification-file product, BOC-3, and UCR are described on their pages and are not checkout items. A medical-card date on a roster is a reminder the employer typed.</p>
      </section>
      <section>
        <H2>Private files inside one pool</H2>
        <p className="mt-3">Fleets of two or more are drawn together. The result, the roster, and a note stay on that account. A hire-screen account is not drawn at all.</p>
      </section>
    </LearnArticle>
  );
}
