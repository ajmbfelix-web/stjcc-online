import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, PublicShell } from "@/components/public-shell";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/service-area")({
  head: () => ({
    meta: [
      { title: pageTitle("Service area") },
      { name: "description", content: "SJCC is built for small employers in Southeast Michigan. Collection is nationwide through Quest and LabCorp sites." },
    ],
    links: [{ rel: "canonical", href: canonical("/service-area") }],
  }),
  component: Area,
});

function Area() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="Service area"
        title="The office is here. The clinics are not only here."
        lede="SJCC is for small employers in Southeast Michigan: Flint, Genesee County, and Oakland County, including Waterford, Clarkston, Troy, and Auburn Hills."
      />
      <section className="mx-auto max-w-3xl space-y-4 px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6">
        <p>That is who the program is built for. It is not a claim that collection only happens in Michigan.</p>
        <p>Drug tests are collected at Quest and LabCorp sites through our testing partner, including sites outside the state when the person is not local. SJCC does not own those sites and does not publish a site count as if the network were ours.</p>
        <p>Sales is still a person. <Link to="/contact" className="text-accent hover:underline">Contact the office</Link>.</p>
      </section>
    </PublicShell>
  );
}
