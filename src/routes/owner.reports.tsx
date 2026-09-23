import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { OwnerFrame, ownerHeaders } from "@/components/owner-frame";
import { SignInGate } from "@/lib/auth/gates";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/owner/reports")({
  head: () => ({ meta: [{ title: pageTitle("Reports") }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <SignInGate><ReportsPage /></SignInGate>,
});

type CompanyPace = {
  id: string;
  organizationName: string;
  pool: number;
  drugDraws: number;
  drugExpected: number;
  alcoholDraws: number;
  alcoholExpected: number;
  behind: boolean;
  smallFleet: boolean;
  eligible: boolean;
};

type Desk = {
  clients?: Array<{ organizationName: string; billedDrivers: number }>;
  orders?: Array<{ status: string; channel: string }>;
  pace?: { behind: number; withPool: number };
  companyPace?: CompanyPace[];
  quarter?: number;
};

function ChartCard({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="px-2 text-2xl">{title}</h2>
      <p className="px-2 pb-3 text-sm text-muted-foreground">{note}</p>
      <div className="h-64">{children}</div>
    </section>
  );
}

function ReportsPage() {
  const [desk, setDesk] = useState<Desk | null>(null);
  useEffect(() => {
    void fetch("/api/owner/desk", { headers: ownerHeaders(), credentials: "include" })
      .then(async (response) => setDesk((await response.json()) as Desk));
  }, []);
  const seats = (desk?.clients ?? []).map((client) => ({ name: client.organizationName.slice(0, 18), seats: client.billedDrivers }));
  const statusCount = new Map<string, number>();
  const channelCount = new Map<string, number>();
  for (const order of desk?.orders ?? []) {
    statusCount.set(order.status, (statusCount.get(order.status) ?? 0) + 1);
    channelCount.set(order.channel, (channelCount.get(order.channel) ?? 0) + 1);
  }
  const statusRows = [...statusCount.entries()].map(([name, count]) => ({ name, count }));
  const channelRows = [...channelCount.entries()].map(([name, count]) => ({ name, count }));
  return (
    <OwnerFrame title="Reports." lede="Seats by client and each company's own random pace. These charts do not combine fleets and do not file a Clearinghouse report.">
      <p className="text-sm text-muted-foreground">Quarter {desk?.quarter ?? "—"}. {desk?.pace ? `${desk.pace.behind} of ${desk.pace.withPool} companies with a standalone pool are behind their own pace.` : "Pace is per company."}</p>
      <section className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <tr><th className="px-4 py-3">Company</th><th className="px-4 py-3">Pool</th><th className="px-4 py-3">Drug pace</th><th className="px-4 py-3">Alcohol pace</th><th className="px-4 py-3">State</th></tr>
          </thead>
          <tbody>
            {(desk?.companyPace ?? []).map((company) => (
              <tr key={company.id} className="border-b border-border">
                <td className="px-4 py-3"><a className="text-accent hover:underline" href={`/owner/clients/${company.id}`}>{company.organizationName}</a></td>
                <td className="px-4 py-3 tabular-nums">{company.pool}</td>
                <td className="px-4 py-3 tabular-nums">{company.eligible ? `${company.drugDraws} / ${company.drugExpected}` : "—"}</td>
                <td className="px-4 py-3 tabular-nums">{company.eligible ? `${company.alcoholDraws} / ${company.alcoholExpected}` : "—"}</td>
                <td className="px-4 py-3">{company.smallFleet ? "Too small" : company.behind ? "Behind" : company.eligible ? "On pace" : "Not in random"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Seats by client" note="Each bar is billed testing drivers, at $7 a seat.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seats}>
              <XAxis dataKey="name" stroke="var(--color-subtle)" fontSize={11} interval={0} angle={-20} height={60} />
              <YAxis stroke="var(--color-subtle)" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="seats" fill="var(--color-primary)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Tests by status" note="Unpaid is not ordered. Prepaid stays here until the laboratory accepts it.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusRows}>
              <XAxis dataKey="name" stroke="var(--color-subtle)" fontSize={11} />
              <YAxis stroke="var(--color-subtle)" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-secondary-foreground)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Where the test came from" note="Client seats, one-off companies, and staffing screens.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelRows}>
              <XAxis dataKey="name" stroke="var(--color-subtle)" fontSize={12} />
              <YAxis stroke="var(--color-subtle)" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </OwnerFrame>
  );
}
