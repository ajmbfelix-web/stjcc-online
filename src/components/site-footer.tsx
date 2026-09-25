import { Link } from "@tanstack/react-router";
import { NAV } from "@/lib/site/nav";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
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
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-subtle sm:flex-row sm:justify-between sm:px-6">
          <p>St. Joseph Compliance Company · Southeast Michigan · Partner collection network, not our clinics</p>
          <p className="flex gap-4">
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
