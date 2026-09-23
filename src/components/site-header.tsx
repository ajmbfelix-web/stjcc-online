import { Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", hash: "capabilities", label: "Capabilities" },
  { to: "/", hash: "architecture", label: "Architecture" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="min-w-0">
          <span className="sm:hidden">
            <Wordmark compact />
          </span>
          <span className="hidden sm:block">
            <Wordmark />
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={`${link.to}#${link.hash}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost" className="hidden shrink-0 sm:inline-flex">
            <Link to="/screen">Order a test</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link to="/login">Client sign-in</Link>
          </Button>
          <Button asChild size="sm" className="shrink-0">
            <Link to="/onboarding">Start onboarding</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
