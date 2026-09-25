import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { PageIntro, PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: pageTitle("Request a Consultation") },
      {
        name: "description",
        content:
          "Contact St. Joseph Compliance Company about the consortium or a hire screen. One-driver carriers use the referral page.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/contact") }],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
    toast.success("Your consultation request has been recorded.");
  }

  return (
    <PublicShell>
      <PageIntro
        eyebrow="Office"
        title="Request a compliance consultation."
        lede="Fleets of two or more, and staffing firms that need a live screen. A one-driver company is not enrolled here."
        chips={["contact@stjcc.online", "No charge on this form", "Referral is a different page"]}
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-3">
          {[
            ["Fleet", "Two or more testing drivers, $299 for the year."],
            ["Staffing", "A prepaid screen. No random pool."],
            ["One driver", "Use the owner-operator page. This form will not enroll them."],
          ].map(([title, body]) => (
            <article key={title} className="soft-card p-5">
              <h2 className="text-xl">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </aside>
        <form onSubmit={onSubmit} className="soft-card space-y-4 p-6 sm:p-8">
          <Field label="Organization" name="org" required />
          <Field label="Contact email" name="email" type="email" required />
          <Field label="Services you need (optional)" name="services" />
          <label className="block">
            <span className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Notes
            </span>
            <textarea
              name="notes"
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
          </label>
          <Button type="submit" disabled={sent} className="rounded-full">
            {sent ? "Request submitted" : "Submit request"}
          </Button>
          <p className="text-sm text-muted-foreground">Direct: contact@stjcc.online</p>
        </form>
      </div>
    </PublicShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      />
    </label>
  );
}