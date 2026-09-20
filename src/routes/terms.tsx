import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: pageTitle("Terms of Service") },
      {
        name: "description",
        content:
          "Terms of service for St. Joseph Compliance Company compliance services at stjcc.online.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/terms") }],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Legal
        </p>
        <h1 className="mt-3 text-3xl font-medium">Terms of Service</h1>
        <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            This website describes St. Joseph Compliance Company’s compliance
            services. Any owner workspace or operational demonstration is
            restricted to authorized SJCC staff and does not provide clients with
            access to confidential screening records.
          </p>
          <p>
            Services are subject to a written agreement, applicable DOT and FMCSA
            requirements, and the authorization terms provided to each employer.
          </p>
          <p>
            THE POC IS PROVIDED “AS IS.” SJCC DISCLAIMS WARRANTIES TO THE MAXIMUM
            EXTENT PERMITTED BY LAW. Liability is limited to fees actually paid
            for the applicable service period, if any.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
