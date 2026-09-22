import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { requireOwner } from "@/lib/portal/owner.server";

function csvCell(value: unknown): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export const Route = createFileRoute("/api/owner/reports/operations")({
  server: { handlers: { GET: async ({ request }) => {
    try {
      await requireOwner(request);
      const sql = await getSql();
      const [onboarding, drivers, events, exceptions] = await Promise.all([
        sql.query<Record<string, unknown>>("select id, organization_name, dot_number, contact_email, driver_count, status, created_at from client_onboarding order by created_at desc"),
        sql.query<Record<string, unknown>>("select account_id, count(*)::int as driver_count from compliance_drivers group by account_id order by account_id"),
        sql.query<Record<string, unknown>>("select account_id, count(*)::int as event_count from compliance_events group by account_id order by account_id"),
        sql.query<Record<string, unknown>>("select id, account_id, title, severity, created_at from compliance_exceptions where resolved = false order by created_at desc"),
      ]);
      const lines = [
        ["section", "id", "organization_or_account", "contact_or_title", "status_or_count", "created_at"].map(csvCell).join(","),
        ...onboarding.map((row) => ["onboarding", row.id, row.organization_name, row.contact_email, row.status, row.created_at].map(csvCell).join(",")),
        ...drivers.map((row) => ["drivers", "", row.account_id, "", row.driver_count, ""].map(csvCell).join(",")),
        ...events.map((row) => ["events", "", row.account_id, "", row.event_count, ""].map(csvCell).join(",")),
        ...exceptions.map((row) => ["open_exception", row.id, row.account_id, row.title, row.severity, row.created_at].map(csvCell).join(",")),
      ];
      return new Response(`${lines.join("\n")}\n`, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="sjcc-operations-report.csv"', "cache-control": "no-store" } });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "Owner access required" }, { status: 403 });
    }
  } } },
});