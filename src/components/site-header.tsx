import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/fleets", label: "Fleets" },
  { to: "/hire", label: "Hire screens" },
  { to: "/testing", label: "Testing" },
  { to: "/learn", label: "Learn" },
  { to: "/pricing", label: "Pricing" },
  { to: "/how-it-works", label: "Process" },
  { to: "/service-area", label: "Service area" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="min-w-0" onClick={() => setOpen(false)}>
          <span className="sm:hidden">
            <Wordmark compact />
          </span>
          <span className="hidden sm:block">
            <Wordmark />
          </span>
        </Link>
        <nav className="hidden items-center gap-5 lg:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="text-[13px] text-muted-foreground hover:text-foreground">
              {link.label}
            </Link>
          ))}
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
            className="inline-flex h-9 items-center border border-border px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground lg:hidden"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-border bg-background px-4 py-3 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block border-b border-border/70 py-3 text-sm text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} className="block py-3 text-sm text-muted-foreground">
            Sign in
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
