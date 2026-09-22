import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { SignInButtons } from "@/lib/auth/gates";
import { Wordmark } from "@/components/logo";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: pageTitle("Client Sign In") }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ClientLogin,
});

function ClientLogin() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        <Wordmark compact />
        <Badge tone="live" className="mt-8">Client portal</Badge>
        <h1 className="mt-4 text-4xl">Sign in to your compliance workspace.</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Access your organization&apos;s drivers, testing status, reports, and required actions.
        </p>
        <div className="mt-7 flex justify-center"><SignInButtons callbackURL="/dashboard" /></div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need an organization account? <Link to="/onboarding" className="text-accent hover:underline">Start onboarding</Link>
        </p>
        <Link to="/" className="mt-5 block text-center text-sm text-accent hover:underline">Return to site</Link>
      </section>
    </main>
  );
}