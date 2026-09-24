import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: pageTitle("Privacy Policy") },
      {
        name: "description",
        content:
          "Privacy policy for St. Joseph Compliance Company (stjcc.online): how screening, CDL, and compliance data is processed for DOT workflows.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/privacy") }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Legal
        </p>
        <h1 className="mt-3 text-3xl font-medium">Privacy Policy</h1>
        <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            St. Joseph Compliance Company (“SJCC”, “we”) operates stjcc.online as a
            independent DOT compliance software platform. This policy describes how
            we handle information submitted through the site and authorized systems.
          </p>
          <p>
            Operational data (driver identifiers, CDL numbers, screening statuses)
            is processed to run that employer's own random program, or a hire screen, and to order drug, alcohol,
            background, and motor vehicle record work through SJCC's testing partner. Collection sites are Quest and LabCorp locations. They are not SJCC clinics.
          </p>
          <p>
            We do not sell personal information. Access is limited to personnel and
            processors required to complete a screening. Webhook payloads are
            verified and retained only as needed for audit and dispute resolution. Public
            visitors never receive access to PII, test results, or internal audit reports.
          </p>
          <p>
            Contact privacy@stjcc.online for access, correction, or deletion
            requests related to this environment.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
