import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  lede,
  chips,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  chips?: string[];
}) {
  return (
    <header className="relative overflow-hidden border-b border-border">
      <div className="grid-paper pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -right-20 top-6 size-72 rounded-full border border-accent/35" />
      <div className="pointer-events-none absolute -right-6 top-16 size-40 rounded-full border border-foreground/10" />
      <div className="pointer-events-none absolute right-16 top-10 size-16 rounded-full bg-accent/25" />
      <div className="pointer-events-none absolute -left-10 bottom-0 size-40 rounded-full bg-muted" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-card px-3 py-1 font-mono text-xs uppercase tracking-widest text-foreground">
          <span className="size-1.5 rounded-full bg-accent" />
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-4xl text-4xl sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{lede}</p>
        {chips?.length ? (
          <div className="mt-7 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span key={chip} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}
