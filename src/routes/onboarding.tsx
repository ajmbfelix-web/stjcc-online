import { createFileRoute, Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/logo";
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
        <h1 className="mt-4 text-4xl sm:text-5xl">Fleet program, or a hire screen.</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">These are different products. A one-truck operator is not a third one.</p>
        <div className="mt-10 grid gap-4">
          <Link to="/onboarding/fleet" className="border border-border bg-card p-6 hover:border-accent">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Two or more testing drivers</p>
            <h2 className="mt-3 text-3xl">Fleet program</h2>
            <p className="mt-3 text-sm text-muted-foreground">$7 per testing driver per month. Your company is its own random pool. Tests are prepaid on top.</p>
          </Link>
          <Link to="/onboarding/hire" className="border border-border bg-card p-6 hover:border-accent">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Staffing and offices</p>
            <h2 className="mt-3 text-3xl">Hire screen</h2>
            <p className="mt-3 text-sm text-muted-foreground">No monthly seat. No random pool. Pay only when you order a drug screen or background.</p>
          </Link>
          <p className="border border-border px-5 py-4 text-sm text-muted-foreground">
            One driver? You need a consortium. SJCC does not run a pool of one. <Link to="/contact" className="text-accent hover:underline">Contact us</Link> or <Link to="/screen" className="text-accent hover:underline">order a single screen</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
