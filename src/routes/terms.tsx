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
          "Terms of service for the St. Joseph Compliance Company proof-of-concept at stjcc.online, including LTS sandbox evaluation limits.",
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
            This website is a proof-of-concept demonstration of St. Joseph
            Compliance Company’s screening orchestration platform. Simulated
            orders and webhook events are for partner evaluation with Lab Testing
            Solutions and do not constitute production chain-of-custody.
          </p>
          <p>
            You may not reverse engineer, overload, or misuse the API endpoints.
            Production use requires a written partner agreement, valid API
            credentials, and applicable DOT/FMCSA program enrollment.
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
