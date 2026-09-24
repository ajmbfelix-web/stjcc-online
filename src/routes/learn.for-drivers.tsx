import { createFileRoute, Link } from "@tanstack/react-router";
import { H2, LearnArticle } from "@/components/learn-article";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/learn/for-drivers")({
  head: () => ({
    meta: [
      { title: pageTitle("If you were selected") },
      { name: "description", content: "What a driver does after SJCC or the employer says it is time to test." },
    ],
    links: [{ rel: "canonical", href: canonical("/learn/for-drivers") }],
  }),
  component: Page,
});

function Page() {
  return (
    <LearnArticle
      eyebrow="Drivers"
      title="Go when you are told."
      lede="A random test is not an appointment you move to a quieter week. Once your company notifies you, the clock is the company's, under the DOT rules they have to follow."
    >
      <section>
        <H2>Before you leave</H2>
        <p className="mt-3">Take a photo identification. Know which site you were sent to. The site is a Quest or LabCorp collection location through our testing partner. It is not an SJCC office, and SJCC does not give you a laboratory login.</p>
        <p className="mt-3">Tell your dispatcher you are going. Do not send someone else. Do not stop for a long errand on the way if you were told to go now.</p>
      </section>
      <section>
        <H2>At the site</H2>
        <p className="mt-3">A drug test under this program is a urine collection. A breath alcohol test, if you were also selected for one, is a separate test on a breath device. They are not the same order and not the same procedure.</p>
        <p className="mt-3">Stay until the collector finishes. Follow the instructions you are given, including any request to empty pockets or to wash your hands. Leaving early, refusing a required step, or tampering with the specimen is treated as a refusal. A refusal is not a “missed appointment.”</p>
      </section>
      <section>
        <H2>Afterward</H2>
        <p className="mt-3">You go back to work unless your employer tells you otherwise. The result is reported to the employer through SJCC. If a medical review officer needs to ask you about a prescription, answer the call. Ignoring that call can turn an explainable result into a verified problem.</p>
        <p className="mt-3">If you were not given a site, a time, or a form of identification to bring, call your company. <Link to="/contact" className="text-accent hover:underline">SJCC’s contact page</Link> is for the employer. Your dispatcher is the first call.</p>
      </section>
    </LearnArticle>
  );
}
