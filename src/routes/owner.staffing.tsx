import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { OwnerFrame, ownerHeaders } from "@/components/owner-frame";
import { SignInGate } from "@/lib/auth/gates";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/owner/staffing")({
  head: () => ({ meta: [{ title: pageTitle("Staffing") }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <SignInGate><StaffingDesk /></SignInGate>,
});

function StaffingDesk() {
  const [rows, setRows] = useState<Array<{ id: string; companyName: string; candidateName: string; status: string; amountCents: number; resultEmail: string }>>([]);
  const [href, setHref] = useState("/screen");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    setHref(`${window.location.origin}/screen`);
    void fetch("/api/owner/desk", { headers: ownerHeaders(), credentials: "include" })
      .then(async (response) => {
        const json = (await response.json()) as { orders?: Array<{ id: string; channel: string; companyName: string; candidateName: string; status: string; amountCents: number; resultEmail: string }> };
        setRows((json.orders ?? []).filter((order) => order.channel === "staffing"));
      });
  }, []);
  return (
    <OwnerFrame title="Staffing screens." lede="Give recruiters this page. The candidate pays before the test is ordered. The result goes to the staffing company, and the difference between the price and the estimated lab cost stays with SJCC.">
      <section className="rounded-xl border border-border bg-card p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recruiter link</p>
        <p className="mt-2 break-all text-sm">{href}</p>
        <button
          type="button"
          className="mt-3 text-sm text-accent hover:underline"
          onClick={() => {
            void navigator.clipboard.writeText(href).then(() => setCopied(true));
          }}
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </section>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl border border-border bg-card p-4 text-sm">
            <div className="font-medium">{row.candidateName} · {row.companyName}</div>
            <div className="text-muted-foreground">{row.status} · ${(row.amountCents / 100).toFixed(2)} · {row.resultEmail}</div>
          </article>
        ))}
        {!rows.length ? <p className="text-sm text-muted-foreground">No staffing orders yet.</p> : null}
      </div>
    </OwnerFrame>
  );
}
