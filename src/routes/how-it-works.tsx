import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, PublicShell } from "@/components/public-shell";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: pageTitle("How it works") },
      { name: "description", content: "SJCC takes the order, the testing partner collects it, and the result returns to the SJCC portal." },
    ],
    links: [{ rel: "canonical", href: canonical("/how-it-works") }],
  }),
  component: How,
});

const steps = [
  ["Request", "You choose the fleet program or a hire screen, then name the person and the product. A fleet under two testing drivers is stopped."],
  ["Schedule", "After payment, the person receives instructions. They do not get a laboratory account."],
  ["Complete", "Drug tests are collected at Quest or LabCorp sites through our testing partner. Background and driving records are ordered the same way: paid first."],
  ["Review", "The laboratory and medical review officer do their work. SJCC does not mark an order sent before the partner accepts it."],
  ["Report", "The employer reads status in the SJCC portal. Fleet draws stay inside that company. Hire accounts have no draw."],
];

function How() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="How it works"
        title="Five steps. One office."
        lede="SJCC holds the agreement, the roster, the random math, and the file. The testing partner holds the clinic visit."
      />
      <ol className="mx-auto max-w-3xl space-y-6 px-4 py-14 sm:px-6">
        {steps.map(([title, body], index) => (
          <li key={title} className="border-b border-border pb-6">
            <p className="font-mono text-[10px] text-accent">0{index + 1}</p>
            <h2 className="mt-2 text-2xl">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>
      <div className="mx-auto max-w-3xl px-4 pb-14 sm:px-6">
        <Link to="/onboarding" className="text-sm text-accent hover:underline">Choose a product</Link>
      </div>
    </PublicShell>
  );
}
