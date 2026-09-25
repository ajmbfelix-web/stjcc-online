import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { NAV } from "@/lib/site/nav";

function Groups({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {NAV.map((group) => (
        <details key={group.label} className="nav-details border-b border-border lg:border-0">
          <summary className="flex min-h-11 items-center justify-between px-1 text-sm text-foreground lg:px-2 lg:text-muted-foreground">
            {group.label}
            <span className="font-mono text-xs text-subtle lg:ml-1" aria-hidden>
              +
            </span>
          </summary>
          <div className="nav-panel pb-2 lg:pb-0">
            {group.links.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                onClick={onNavigate}
                className="block min-h-11 px-3 py-3 text-sm text-foreground hover:bg-muted lg:min-h-0 lg:py-2"
              >
                {label}
              </Link>
            ))}
          </div>
        </details>
      ))}
    </>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="min-w-0" onClick={() => setOpen(false)}>
          <span className="sm:hidden">
            <Wordmark compact />
          </span>
          <span className="hidden sm:block">
            <Wordmark />
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <Groups />
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/onboarding">Enroll</Link>
          </Button>
          <button
            type="button"
            className="inline-flex h-11 items-center border border-border px-3 font-mono text-xs uppercase tracking-widest text-muted-foreground lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" className="border-t border-border bg-background px-4 py-2 lg:hidden" aria-label="Mobile">
          <Groups onNavigate={() => setOpen(false)} />
          <Link to="/login" onClick={() => setOpen(false)} className="block min-h-11 py-3 text-sm text-muted-foreground">
            Sign in
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
