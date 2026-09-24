import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, PublicShell } from "@/components/public-shell";
import { LEARN } from "@/lib/learn";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: pageTitle("For drivers and employers") },
      {
        name: "description",
        content:
          "Plain-language notes on SJCC random testing, the collection visit, results, driving records, and hire screens. Not a legal manual.",
      },
    ],
    links: [{ rel: "canonical", href: canonical("/learn") }],
  }),
  component: LearnHome,
});

function LearnHome() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="For drivers and employers"
        title="What the test day actually is."
        lede="SJCC is the office. The clinic is a Quest or LabCorp site. These pages say what a driver is expected to do, and what this company will not pretend to sell."
      />
      <section className="mx-auto grid max-w-6xl gap-px bg-border px-4 py-12 sm:grid-cols-2 sm:px-6">
        {LEARN.map((item) => (
          <Link key={item.to} to={item.to} className="bg-background p-6 hover:bg-card">
            <h2 className="text-2xl text-foreground">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
          </Link>
        ))}
      </section>
    </PublicShell>
  );
}
