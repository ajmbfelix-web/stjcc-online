import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { requirePortalAccess } from "@/lib/portal/access.server";

export const Route = createFileRoute("/api/v1/portal")({
  server: { handlers: { GET: async ({ request }) => {
    try {
      const access = await requirePortalAccess(request);
      const sql = await getSql();
      if (access.kind === "unassigned") return Response.json({ access: { kind: access.kind }, drivers: [], events: [], exceptions: [] });
      if (access.kind === "owner") {
        const [onboarding, drivers, events, exceptions] = await Promise.all([
          sql.query(`select id, organization_name as "organizationName", dot_number as "dotNumber", contact_name as "contactName", contact_email as "contactEmail", driver_count as "driverCount", status, created_at as "createdAt" from client_onboarding order by created_at desc`),
          sql.query(`select account_id as "accountId", count(*)::int as count from compliance_drivers group by account_id order by account_id`),
          sql.query(`select account_id as "accountId", count(*)::int as count from compliance_events group by account_id order by account_id`),
          sql.query(`select id, account_id as "accountId", title, description, severity, resolved, created_at as "createdAt" from compliance_exceptions where resolved = false order by created_at desc`),
        ]);
        return Response.json({ access: { kind: access.kind }, onboarding, drivers, events, exceptions });
      }
      const [onboarding, drivers, events, exceptions] = await Promise.all([
        sql.query(`select id, organization_name as "organizationName", dot_number as "dotNumber", contact_name as "contactName", contact_email as "contactEmail", driver_count as "driverCount", status, created_at as "createdAt" from client_onboarding where id = $1`, [access.onboardingId]),
        sql.query(`select id, name, cdl, test_type as "testType", status, barcode, updated_at as "updatedAt" from compliance_drivers where account_id = $1 order by updated_at desc`, [access.onboardingId]),
        sql.query(`select id, source, path, payload, received_at as "receivedAt" from compliance_events where account_id = $1 order by received_at desc limit 50`, [access.onboardingId]),
        sql.query(`select id, title, description, severity, created_at as "createdAt" from compliance_exceptions where account_id = $1 and resolved = false order by created_at desc`, [access.onboardingId]),
      ]);
      return Response.json({ access: { kind: access.kind, onboardingId: access.onboardingId, role: access.role }, onboarding: onboarding[0] ?? null, drivers, events, exceptions });
    } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Portal unavailable" }, { status: 401 }); }
  } } },
});