import { createFileRoute, Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/logo";
import { FLEET_ANNUAL_CENTS, money } from "@/lib/billing/catalog";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: pageTitle("Enroll") }, { name: "robots", content: "noindex, nofollow" }] }),
  component: OnboardingChooser,
});

function OnboardingChooser() {
  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Wordmark compact />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Choose a door</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">Fleet, hire screen, or a referral.</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">A one-driver company cannot continue to payment.</p>
        <div className="mt-10 grid gap-4">
          <Link to="/onboarding/fleet" className="border border-border bg-card p-6 hover:border-accent">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">Two or more testing drivers</p>
            <h2 className="mt-3 text-3xl">Fleet consortium</h2>
            <p className="mt-3 text-sm text-muted-foreground">{money(FLEET_ANNUAL_CENTS)} per year. Unlimited testing drivers. One shared pool. Your file stays private. Tests are prepaid.</p>
          </Link>
          <Link to="/onboarding/hire" className="border border-border bg-card p-6 hover:border-accent">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">Staffing and offices</p>
            <h2 className="mt-3 text-3xl">Hire screen</h2>
            <p className="mt-3 text-sm text-muted-foreground">No membership. No random pool. Pay only for a live screen.</p>
          </Link>
          <p className="border border-border px-5 py-4 text-sm text-muted-foreground">
            One driver? Do not pay. <Link to="/owner-operators" className="text-accent hover:underline">Use the referral</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
