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
      { title: pageTitle("Request API Integration Access") },
      {
        name: "description",
        content:
          "Request Lab Testing Solutions (LTS) API integration access with St. Joseph Compliance Company at stjcc.online. Partner ID, webhook secret, and callback URL onboarding.",
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
    toast.success("Integration request recorded for LTS partner review.");
  }

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
          Partner access
        </p>
        <h1 className="mt-3 text-3xl font-medium">Request API integration access</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          For Lab Testing Solutions sandbox pairing. We will follow up with
          partner ID, webhook secret rotation, and callback URL confirmation.
        </p>
        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <Field label="Organization" name="org" required />
          <Field label="Contact email" name="email" type="email" required />
          <Field label="LTS contact / ticket (optional)" name="lts" />
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
