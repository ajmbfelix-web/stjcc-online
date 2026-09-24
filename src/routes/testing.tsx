import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, PublicShell } from "@/components/public-shell";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/testing")({
  head: () => ({
    meta: [
      { title: pageTitle("Testing") },
      { name: "description", content: "How an SJCC test visit works. Pay on SJCC, collect at Quest or LabCorp, read the result in the portal." },
    ],
    links: [{ rel: "canonical", href: canonical("/testing") }],
  }),
  component: Testing,
});

function Testing() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="Testing"
        title="The visit is not our clinic."
        lede="You pay SJCC. The person gets instructions. Collection is at a Quest or LabCorp site through our testing partner. The result comes back into the SJCC portal."
      />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6">
        <p>DOT urine and breath alcohol are separate orders. If a driver needs both, both are charged. SJCC does not sell them as one laboratory product.</p>
        <p>Non-DOT urine panels and hair are on the same catalog, for hire screens and for fleets that order them. They are not a random program by themselves.</p>
        <p>Until the testing partner is connected, a paid order stays paid and unsent. SJCC does not invent a barcode or a clinic confirmation.</p>
        <p>SJCC does not file Clearinghouse reports. A non-negative or a refusal stays an owner decision inside SJCC.</p>
        <Link to="/pricing" className="inline-block text-accent hover:underline">Catalog prices</Link>
      </section>
    </PublicShell>
  );
}
