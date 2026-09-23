import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Building2, ClipboardList, LayoutDashboard, Users, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/logo";
import { getBearerToken } from "@/lib/auth/client";

const links = [
  ["/owner", "Today", LayoutDashboard],
  ["/owner/money", "Money", Wallet],
  ["/owner/tests", "Tests", ClipboardList],
  ["/owner/clients", "Clients", Building2],
  ["/owner/reports", "Reports", BarChart3],
  ["/owner/staffing", "Staffing", Users],
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
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border-b border-border bg-card lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4 lg:block">
          <Link to="/" aria-label="Home"><Wordmark compact /></Link>
          <a href="/api/owner/reports/operations" className="text-sm text-accent hover:underline lg:mt-4 lg:inline-block">Operations export</a>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-6">
          {links.map(([to, label, Icon]) => {
            const active = to === "/owner" ? path === "/owner" : path === to || path.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                className={active
                  ? "inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                  : "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"}
              >
                <Icon className="size-4" strokeWidth={1.6} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="min-w-0">
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:py-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Owner desk</p>
            <h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">{lede}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
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
