import { createFileRoute, Link } from "@tanstack/react-router";
import { H2, LearnArticle } from "@/components/learn-article";
import { CATALOG, money } from "@/lib/billing/catalog";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/learn/records")({
  head: () => ({
    meta: [
      { title: pageTitle("Driving records") },
      { name: "description", content: "A motor vehicle record is a state driving record SJCC orders. Typing a date on a roster does not create one." },
    ],
    links: [{ rel: "canonical", href: canonical("/learn/records") }],
  }),
  component: Page,
});

function Page() {
  return (
    <LearnArticle
      eyebrow="Records"
      title="The record is the state’s, not a date in a spreadsheet."
      lede={`SJCC orders a motor vehicle record for ${money(CATALOG.mvr.cents)}, paid before the order is placed. The same price applies on a fleet account and on a hire screen.`}
    >
      <section>
        <H2>What you are buying</H2>
        <p className="mt-3">A motor vehicle record is the driver’s record as the state keeps it: license status, violations, and suspensions that the state reports. Employers look at it when they hire and, for many CDL drivers, again during employment. The point is to read the state’s document, not to remember that someone “checked it.”</p>
      </section>
      <section>
        <H2>What a date field is</H2>
        <p className="mt-3">The roster can store the day someone says a record was reviewed. That field is a reminder. It does not contact the state, and it is not proof that a record was ordered. If you need the record, order it. The status then lives with the order, not as a typed anniversary.</p>
      </section>
      <section>
        <H2>What this is not</H2>
        <p className="mt-3">SJCC does not sell a pre-employment screening report from FMCSA’s crash file, a CDLIS extract, or a qualification-file service that stores the rest of a driver’s hiring packet. Those are different products. We order the driving record. The employer keeps the rest of the file.</p>
        <p className="mt-3"><Link to="/mvr" className="text-accent hover:underline">The MVR page</Link> is the product. This page is the explanation.</p>
      </section>
    </LearnArticle>
  );
}
