import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Ban,
  Beaker,
  Briefcase,
  Building2,
  Car,
  ChevronDown,
  CircleHelp,
  Droplets,
  Eye,
  FileBadge,
  FileStack,
  FlaskConical,
  FolderOpen,
  GraduationCap,
  House,
  Landmark,
  LayoutGrid,
  Mail,
  MapPin,
  Route,
  Scale,
  ScrollText,
  Search,
  Shield,
  Shuffle,
  Siren,
  Spline,
  Stamp,
  Stethoscope,
  Tags,
  TestTubes,
  TriangleAlert,
  UserPlus,
  Users,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { NAV } from "@/lib/site/nav";

const ICONS: Record<string, LucideIcon> = {
  "/": House,
  "/consortium": Users,
  "/owner-operators": Ban,
  "/hire": Briefcase,
  "/services": LayoutGrid,
  "/how-it-works": Route,
  "/service-area": MapPin,
  "/pricing": Tags,
  "/testing": FlaskConical,
  "/dot-urine": TestTubes,
  "/non-dot": Droplets,
  "/breath-alcohol": Wind,
  "/hair": Spline,
  "/oral-fluid": Beaker,
  "/randoms": Shuffle,
  "/pre-employment": UserPlus,
  "/post-accident": Siren,
  "/reasonable-suspicion": Eye,
  "/return-to-duty": TriangleAlert,
  "/mvr": Car,
  "/psp": Shield,
  "/backgrounds": Search,
  "/clearinghouse": Landmark,
  "/driver-files": FolderOpen,
  "/physicals": Stethoscope,
  "/supervisor-training": GraduationCap,
  "/policy": ScrollText,
  "/filings": FileStack,
  "/boc-3": Stamp,
  "/ucr": FileBadge,
  "/about": Building2,
  "/contact": Mail,
  "/faq": CircleHelp,
  "/legal": Scale,
};

function Groups({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {NAV.map((group) => (
        <details
          key={group.label}
          className={group.wide ? "nav-details nav-wide" : "nav-details"}
          onMouseEnter={(event) => {
            const current = event.currentTarget;
            current.parentElement?.querySelectorAll("details.nav-details[open]").forEach((node) => {
              if (node !== current) (node as HTMLDetailsElement).open = false;
            });
          }}
          onToggle={(event) => {
            const current = event.currentTarget;
            if (!current.open) return;
            current.parentElement?.querySelectorAll("details.nav-details[open]").forEach((node) => {
              if (node !== current) (node as HTMLDetailsElement).open = false;
            });
          }}
        >
          <summary className="flex min-h-11 items-center gap-1 rounded-full px-3 text-sm text-foreground hover:bg-muted lg:text-muted-foreground">
            {group.label}
            <ChevronDown className="size-3.5 opacity-70" aria-hidden />
          </summary>
          <div className="nav-panel">
            <div className="nav-panel-card">
              <p className="nav-kicker px-3 pb-1 pt-2 font-mono text-xs uppercase tracking-widest text-subtle">
                {group.label}
              </p>
              {group.links.map(([to, label, blurb]) => {
                const Icon = ICONS[to] ?? ArrowUpRight;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={onNavigate}
                    className="group flex items-start gap-3 rounded-xl px-2.5 py-2.5 hover:bg-muted"
                  >
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground group-hover:bg-accent/25">
                      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">{label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{blurb}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </details>
      ))}
    </>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="border-b border-border/70 bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-xs sm:px-6">
          <p className="min-w-0 truncate text-background/80">One testing driver is a referral, not a pool of one.</p>
          <div className="flex shrink-0 items-center gap-3">
            <Link to="/owner-operators" className="underline decoration-primary decoration-2 underline-offset-4">
              Owner-operators
            </Link>
            <Link to="/hire" className="hidden text-background/80 hover:text-background sm:inline">
              Staffing
            </Link>
            <Link to="/pricing" className="hidden text-background/80 hover:text-background md:inline">
              Pricing
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <Link to="/" className="min-w-0" onClick={() => setOpen(false)}>
          <span className="xl:hidden">
            <Wordmark compact />
          </span>
          <span className="hidden xl:block">
            <Wordmark />
          </span>
        </Link>
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          <Groups />
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost" className="hidden rounded-full sm:inline-flex">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full px-4">
            <Link to="/onboarding">Enroll</Link>
          </Button>
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-full border border-border px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" className="max-h-[70vh] overflow-y-auto border-t border-border bg-background px-3 py-2 lg:hidden" aria-label="Mobile">
          <Groups onNavigate={() => setOpen(false)} />
          <Link to="/login" onClick={() => setOpen(false)} className="block min-h-11 rounded-xl px-3 py-3 text-sm text-muted-foreground">
            Sign in
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
