import { createFileRoute } from "@tanstack/react-router";
import { H2, LearnArticle } from "@/components/learn-article";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/learn/collection")({
  head: () => ({
    meta: [
      { title: pageTitle("The collection visit") },
      { name: "description", content: "What a DOT urine collection and a breath alcohol test look like at a Quest or LabCorp site." },
    ],
    links: [{ rel: "canonical", href: canonical("/learn/collection") }],
  }),
  component: Page,
});

function Page() {
  return (
    <LearnArticle
      eyebrow="Collection"
      title="The site checks the specimen. You stay until it is done."
      lede="SJCC pays for the order and tells the employer the status. The collection itself happens at a Quest or LabCorp site through our testing partner. Those clinics are not ours."
    >
      <section>
        <H2>Urine drug test</H2>
        <p className="mt-3">You show photo identification. The collector explains the steps. You provide a urine specimen in private unless a DOT rule specifically requires a directly observed collection, which is not the ordinary visit.</p>
        <p className="mt-3">The collector checks the temperature of the specimen at the site. That check is normal. If you cannot provide a specimen right away, DOT collection rules give you time and a limited amount of fluid to try again. Walking out because the first attempt failed is a serious mistake. Ask the collector what the waiting period is. Do not leave the site to “try later at home.”</p>
      </section>
      <section>
        <H2>Breath alcohol</H2>
        <p className="mt-3">This is a breath test, not a urine test, and SJCC bills it as its own order. A screening result under 0.02 ends the alcohol test. A screening result of 0.02 or higher is followed by a confirmation test after a short wait. For FMCSA drivers, 0.04 or higher is a violation. A result from 0.02 up to 0.04 is not that violation, but the driver is kept from safety-sensitive work for a period the rule sets. Your employer applies that rule. SJCC reports the result. SJCC does not decide the duty status for you.</p>
      </section>
      <section>
        <H2>What we will not pretend</H2>
        <p className="mt-3">If the testing partner has not accepted the order, the portal shows it as paid and not sent. SJCC does not invent a barcode, a clinic confirmation, or a result. When the partner is connected, the driver gets real instructions. Until then, nobody should be standing at a clinic window with a made-up form.</p>
      </section>
    </LearnArticle>
  );
}
