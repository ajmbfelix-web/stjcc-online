import { createFileRoute } from "@tanstack/react-router";
import { H2, LearnArticle } from "@/components/learn-article";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/learn/results")({
  head: () => ({
    meta: [
      { title: pageTitle("Results, the MRO, and refusals") },
      { name: "description", content: "How a DOT drug test result is verified, what a refusal is, and why SJCC does not file Clearinghouse reports." },
    ],
    links: [{ rel: "canonical", href: canonical("/learn/results") }],
  }),
  component: Page,
});

function Page() {
  return (
    <LearnArticle
      eyebrow="Results"
      title="A lab finding is not the last word."
      lede="The employer sees a status in the SJCC portal. A non-negative laboratory result is reviewed by a medical review officer before it is a verified result. A refusal is reported as its own outcome."
    >
      <section>
        <H2>Negative</H2>
        <p className="mt-3">The test completed and the verified result is negative. The employer can see that in the portal. There is nothing else for the driver to do on that test.</p>
      </section>
      <section>
        <H2>The medical review officer</H2>
        <p className="mt-3">If the laboratory reports a result that is not negative, a physician acting as the medical review officer contacts the driver. That call exists so a legitimate prescription can be considered before anyone treats the test as a verified positive or a refusal to accept a valid explanation. Answer the phone. A missed call is not a way to pause the result.</p>
        <p className="mt-3">SJCC does not replace the medical review officer and does not argue the science of the test. We record the verified outcome the employer is allowed to see.</p>
      </section>
      <section>
        <H2>Refusal</H2>
        <p className="mt-3">Not going after you were notified, leaving the collection site early, refusing a required step, or altering a specimen are refusals under the DOT testing rules. A refusal is not a cancelled test and it is not “we will reschedule.” Employers treat it as a drug or alcohol violation for duty purposes. SJCC will not recode a refusal into a negative because someone asks.</p>
      </section>
      <section>
        <H2>Clearinghouse</H2>
        <p className="mt-3">FMCSA’s Drug and Alcohol Clearinghouse is the employer’s reporting system. SJCC does not file those reports and does not sell a Clearinghouse query. If a result has to be reported, that duty stays with the motor carrier. Our owner may note, inside SJCC, whether the company says it reported or chose not to. That note is not a filing with FMCSA.</p>
      </section>
    </LearnArticle>
  );
}
