import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/logo";
import { getBearerToken } from "@/lib/auth/client";

const links = [
  ["/owner", "Today"],
  ["/owner/money", "Money"],
  ["/owner/tests", "Tests"],
  ["/owner/clients", "Clients"],
  ["/owner/reports", "Reports"],
  ["/owner/staffing", "Staffing"],
] as const;

export function ownerHeaders(json = false): HeadersInit {
  const token = getBearerToken();
  return {
    ...(json ? { "content-type": "application/json" } : {}),
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

export function OwnerFrame({ title, lede, children }: { title: string; lede: string; children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" aria-label="Home"><Wordmark compact /></Link>
          <a href="/api/owner/reports/operations" className="text-sm text-accent hover:underline">Operations export</a>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
          {links.map(([to, label]) => {
            const active = to === "/owner" ? path === "/owner" : path === to || path.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                className={active
                  ? "shrink-0 rounded-full border border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                  : "shrink-0 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Owner desk</p>
          <h1 className="mt-3 text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">{lede}</p>
        </div>
        {children}
      </div>
    </main>
  );
}

export function MoneyTiles({ book }: { book: { collectedThisMonthCents: number; prepaidCents: number; estimatedVendorCents: number; retainedCents: number; awaitingCharge: number; paidNotSent: number; pastDueClients: number } }) {
  const tiles = [
    ["Collected this month", `$${(book.collectedThisMonthCents / 100).toFixed(0)}`],
    ["Prepaid, not sent", `$${(book.prepaidCents / 100).toFixed(0)}`],
    ["Estimated lab cost", `$${(book.estimatedVendorCents / 100).toFixed(0)}`],
    ["Kept", `$${(book.retainedCents / 100).toFixed(0)}`],
    ["Unpaid tests", String(book.awaitingCharge)],
    ["Paid, waiting on lab", String(book.paidNotSent)],
    ["Cards failing", String(book.pastDueClients)],
  ];
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-border bg-card px-4 py-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl tabular-nums">{value}</div>
        </div>
      ))}
    </section>
  );
}
