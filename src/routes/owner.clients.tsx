import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { OwnerFrame, ownerHeaders } from "@/components/owner-frame";
import { SignInGate } from "@/lib/auth/gates";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/owner/clients")({
  head: () => ({ meta: [{ title: pageTitle("Clients") }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <SignInGate><ClientsPage /></SignInGate>,
});

type Client = { id: string; organizationName: string; contactEmail: string; status: string; billingStatus: string; billedDrivers: number; dotNumber: string };

function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  useEffect(() => {
    void fetch("/api/owner/desk", { headers: ownerHeaders(), credentials: "include" })
      .then(async (response) => setClients(((await response.json()) as { clients?: Client[] }).clients ?? []));
  }, []);
  return (
    <OwnerFrame title="Clients." lede="Each company can download its own audit packet. The packet is the file you would hand an inspector. It does not file anything with the Clearinghouse.">
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <tr><th className="px-4 py-3">Company</th><th className="px-4 py-3">DOT</th><th className="px-4 py-3">Seats</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Packet</th></tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-border">
                <td className="px-4 py-3"><a className="hover:underline" href={`/owner/clients/${client.id}`}>{client.organizationName}</a><div className="text-muted-foreground">{client.contactEmail}</div></td>
                <td className="px-4 py-3 font-mono">{client.dotNumber}</td>
                <td className="px-4 py-3 tabular-nums">{client.billedDrivers}</td>
                <td className="px-4 py-3">{client.status} · {client.billingStatus}</td>
                <td className="px-4 py-3"><a className="text-accent hover:underline" href={`/api/owner/reports/audit?onboardingId=${client.id}`}>Download</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </OwnerFrame>
  );
}
