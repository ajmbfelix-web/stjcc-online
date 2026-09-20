import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium">St. Joseph Compliance Company</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            stjcc.online · DOT C-TPA orchestration
          </p>
          <p className="mt-4 text-xs text-subtle">
            © {new Date().getFullYear()} St. Joseph Compliance Company. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
          <Link to="/contact" className="hover:text-foreground">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
