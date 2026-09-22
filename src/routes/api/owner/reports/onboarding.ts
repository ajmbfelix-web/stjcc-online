import { createFileRoute } from "@tanstack/react-router";
import { requireOwner } from "@/lib/portal/owner.server";
import { listOnboarding } from "@/lib/portal/store";

function csvCell(value: unknown): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export const Route = createFileRoute("/api/owner/reports/onboarding")({
  server: { handlers: { GET: async ({ request }) => {
    try {
      await requireOwner(request);
      const records = await listOnboarding();
      const lines = [
        ["Onboarding ID", "Organization", "DOT Number", "Contact", "Email", "Drivers", "Status", "Created"].map(csvCell).join(","),
        ...records.map((record) => [record.id, record.organizationName, record.dotNumber, record.contactName, record.contactEmail, record.driverCount, record.status, record.createdAt].map(csvCell).join(",")),
      ];
      return new Response(`${lines.join("\n")}\n`, {
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": 'attachment; filename="sjcc-onboarding-report.csv"',
          "cache-control": "no-store",
        },
      });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "Owner access required" }, { status: 403 });
    }
  } } },
});