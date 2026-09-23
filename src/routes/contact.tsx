import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: pageTitle("Request a Consultation") },
      {
        name: "description",
        content:
          "Contact St. Joseph Compliance Company about per-company random testing and LTS-fulfilled screens.",
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
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
          Employer services
        </p>
        <h1 className="mt-3 text-3xl font-medium">Request a compliance consultation</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Tell us what your organization needs help with. We will follow up to
          discuss DOT testing, background screening, or motor vehicle records. Randoms are per company. SJCC does not sell a consortium.
        </p>
        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <Field label="Organization" name="org" required />
          <Field label="Contact email" name="email" type="email" required />
          <Field label="Services you need (optional)" name="services" />
          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Notes
            </span>
            <textarea
              name="notes"
              rows={4}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
          </label>
          <Button type="submit" disabled={sent} className="w-full sm:w-auto">
            {sent ? "Request submitted" : "Submit request"}
          </Button>
        </form>
        <p className="mt-8 text-sm text-muted-foreground">
          Direct: contact@stjcc.online
        </p>
      </main>
      <SiteFooter />
    </div>
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
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      />
    </label>
  );
}
