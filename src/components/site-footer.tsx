import { Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/logo";
import { NAV } from "@/lib/site/nav";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Southeast Michigan consortium for fleets of two or more. Staffing orders a screen. One driver is referred, not charged.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["$299", "fleet year"],
            ["$0", "setup"],
            ["50 / 10", "drug / alcohol"],
            ["20k+", "partner sites"],
          ].map(([value, label]) => (
            <span key={label} className="inline-flex items-baseline gap-2 rounded-full border border-border bg-background px-3 py-1.5">
              <span className="text-sm font-medium tabular-nums">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
          {NAV.map((column) => (
            <div key={column.label}>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{column.label}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {column.links.map(([to, label]) => (
                  <li key={to}>
                    <Link to={to} className="text-foreground/80 hover:text-accent">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-subtle sm:flex-row sm:justify-between sm:px-6">
          <p>St. Joseph Compliance Company · Partner collection network, not our clinics</p>
          <p className="flex flex-wrap gap-4">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
            <span>© {new Date().getFullYear()}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
