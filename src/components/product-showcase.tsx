import { useState } from "react";
import { Activity, ArrowUpRight, CheckCircle2, CircleDashed, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const activity = [
  { name: "John Doe", id: "CDL-*****1234", type: "DOT 5-Panel", status: "Cleared", tone: "ok" as const },
  { name: "Jane Smith", id: "CDL-*****5678", type: "Annual MVR", status: "Collection Pending", tone: "warn" as const },
  { name: "Jordan Lee", id: "CDL-*****9012", type: "Background Screen", status: "Cleared", tone: "ok" as const },
];

const metrics = [
  { label: "Companies on their own pool", value: "Per fleet", icon: Users, detail: "Not one combined draw" },
  { label: "Orders waiting on LTS", value: "Paid, not sent", icon: CircleDashed, detail: "Visible until the lab accepts" },
  { label: "One-driver fleets", value: "Not drawn", icon: CheckCircle2, detail: "49 CFR 382.305" },
];

export function ProductShowcase() {
  const [view, setView] = useState<"overview" | "activity">("overview");

  return (
    <section id="showcase" className="border-y border-border bg-secondary/35">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge tone="live">Interactive Product Showcase (Simulated Data Only)</Badge>
            <h2 className="mt-4 max-w-2xl text-3xl font-medium tracking-tight">
              A clearer view of compliance operations
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Each company is drawn on its own. Testing and screens are fulfilled through Lab Testing Solutions.
            </p>
          </div>
          <Activity className="hidden size-9 text-accent sm:block" strokeWidth={1.4} />
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {metric.label}
                </span>
                <metric.icon className="size-4 text-accent" />
              </div>
              <div className="mt-5 text-3xl font-medium tabular-nums">{metric.value}</div>
              <p className="mt-2 text-xs text-muted-foreground">{metric.detail}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-medium">Recent compliance activity</h3>
              <p className="mt-1 text-xs text-muted-foreground">Sanitized examples for demonstration only.</p>
            </div>
            <div className="flex gap-1 rounded-md border border-border bg-background p-1">
              {(["overview", "activity"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setView(option)}
                  className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    view === option ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-border font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Driver</th>
                  <th className="px-5 py-3 font-medium">Masked CDL</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">View</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((item) => (
                  <tr key={item.id} className="border-b border-border/70 last:border-0">
                    <td className="px-5 py-3 font-medium">{item.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{item.id}</td>
                    <td className="px-5 py-3 text-muted-foreground">{item.type}</td>
                    <td className="px-5 py-3"><Badge tone={item.tone}>{item.status}</Badge></td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-accent">
                        {view === "activity" ? "Activity" : "Details"}
                        <ArrowUpRight className="size-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
