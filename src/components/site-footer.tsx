import { Link } from "@tanstack/react-router";

const columns = [
  {
    title: "Products",
    links: [
      ["/fleets", "Fleet program"],
      ["/hire", "Hire screens"],
      ["/testing", "Testing"],
      ["/mvr", "Motor vehicle records"],
      ["/pricing", "Pricing"],
      ["/screen", "Order a screen"],
    ],
  },
  {
    title: "Company",
    links: [
      ["/how-it-works", "How it works"],
      ["/learn", "For drivers"],
      ["/learn/for-drivers", "If you were selected"],
      ["/service-area", "Service area"],
      ["/contact", "Contact"],
      ["/login", "Client sign-in"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["/privacy", "Privacy"],
      ["/terms", "Terms"],
      ["/owner", "Owner"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:grid-cols-3">
        {columns.map((column) => (
          <div key={column.title}>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{column.title}</p>
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
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-subtle sm:px-6 sm:flex-row sm:justify-between">
          <p>St. Joseph Compliance Company · Southeast Michigan</p>
          <p>© {new Date().getFullYear()} stjcc.online</p>
        </div>
      </div>
    </footer>
  );
}
