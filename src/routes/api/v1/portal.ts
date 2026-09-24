import { createFileRoute } from "@tanstack/react-router";
import { loadClientHistory } from "@/lib/accounts/file.server";
import { activationChecklist, periodKey } from "@/lib/automation/policy";
import { runAutomation } from "@/lib/automation/engine";
import { stripeConfigured } from "@/lib/billing/stripe.server";
import { getSql } from "@/lib/db";
import { requirePortalAccess } from "@/lib/portal/access.server";

export const Route = createFileRoute("/api/v1/portal")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const access = await requirePortalAccess(request);
          let automation: { skipped?: boolean; error?: string } = {};
          try {
            automation = await runAutomation({ reason: "portal" });
          } catch (error) {
            automation = { error: error instanceof Error ? error.message : "Automation cycle failed" };
          }

          const sql = await getSql();
          if (access.kind === "unassigned") {
            return Response.json({ access: { kind: access.kind }, checklist: [], roster: [], selections: [], exceptions: [] });
          }

          if (access.kind === "owner") {
            const [metrics, exceptions, blocked, failedNotifications, lastRun] = await Promise.all([
              sql.query<{ active: number; pending: number; pastDue: number; drivers: number; selections: number }>(
                `select
                   (select count(*)::int from client_onboarding where status = 'active') as active,
                   (select count(*)::int from client_onboarding where status in ('in_progress', 'payment_pending')) as pending,
                   (select count(*)::int from client_onboarding where billing_status = 'past_due' or status = 'suspended') as "pastDue",
                   (select count(*)::int from driver_roster where employment_status = 'active' and in_random_pool = true) as drivers,
                   (select count(*)::int from random_selections where period = $1) as selections`,
                [periodKey(new Date())],
              ),
              sql.query(
                `select id, account_id as "accountId", title, description, severity, source, created_at as "createdAt"
                 from compliance_exceptions
                 where resolved = false and audience = 'owner'
                 order by created_at desc
                 limit 80`,
              ),
              sql.query(
                `select id, organization_name as "organizationName", dot_number as "dotNumber", contact_email as "contactEmail",
                        driver_count as "driverCount", status, billing_status as "billingStatus", created_at as "createdAt"
                 from client_onboarding
                 where status not in ('active', 'past_due')
                 order by created_at desc
                 limit 40`,
              ),
              sql.query(
                `select id, account_id as "accountId", recipient, subject, error, created_at as "createdAt"
                 from notification_outbox where status = 'failed' order by created_at desc limit 20`,
              ),
              sql.query<{ finishedAt: string; summary: unknown }>(
                `select finished_at as "finishedAt", summary from automation_runs where finished_at is not null order by finished_at desc limit 1`,
              ),
            ]);
            return Response.json({
              access: { kind: access.kind },
              metrics: metrics[0] ?? { active: 0, pending: 0, pastDue: 0, drivers: 0, selections: 0 },
              exceptions,
              blocked,
              failedNotifications,
              lastRun: lastRun[0] ?? null,
              automation,
            });
          }

          const onboardingRows = await sql.query<{
            id: string;
            organizationName: string;
            dotNumber: string;
            contactName: string;
            contactEmail: string;
            driverCount: number;
            services: unknown;
            program: string;
            status: string;
            billingStatus: string;
            billedDrivers: number;
            createdAt: string;
          }>(
            `select id, organization_name as "organizationName", dot_number as "dotNumber", contact_name as "contactName",
                    contact_email as "contactEmail", driver_count as "driverCount", services, program, status,
                    billing_status as "billingStatus", billed_driver_count as "billedDrivers", created_at as "createdAt"
             from client_onboarding where id = $1`,
            [access.onboardingId],
          );
          const onboarding = onboardingRows[0] ?? null;
          const checklist = onboarding
            ? activationChecklist({
                status: onboarding.status,
                billingStatus: onboarding.billingStatus,
                billingConfigured: stripeConfigured(),
              })
            : [];

          if (access.kind === "pending_client") {
            return Response.json({
              access: { kind: access.kind, onboardingId: access.onboardingId, role: access.role, status: access.status, billingStatus: access.billingStatus },
              onboarding,
              checklist,
              roster: [],
              selections: [],
              exceptions: [],
              automation,
            });
          }

          const [roster, selections, exceptions] = await Promise.all([
            sql.query(
              `select id, name, cdl, medical_card_expires_on as "medicalCardExpiresOn", mvr_reviewed_on as "mvrReviewedOn",
                      clearinghouse_queried_on as "clearinghouseQueriedOn", hired_on as "hiredOn", in_random_pool as "inRandomPool", needs_testing as "needsTesting"
               from driver_roster
               where account_id = $1 and employment_status = 'active'
               order by name`,
              [access.onboardingId],
            ),
            sql.query(
              `select s.id, s.test_kind as "testKind", s.period, r.name, d.status as "orderStatus"
               from random_selections s
               join driver_roster r on r.id = s.roster_id
               left join compliance_drivers d on d.id = s.order_id
               where s.account_id = $1 and s.period = $2
               order by r.name`,
              [access.onboardingId, periodKey(new Date())],
            ),
            sql.query(
              `select id, title, description, severity, created_at as "createdAt"
               from compliance_exceptions
               where account_id = $1 and audience = 'client' and resolved = false
               order by created_at desc`,
              [access.onboardingId],
            ),
          ]);

          if (!access.onboardingId) {
            return Response.json({ error: "An active organization workspace is required" }, { status: 403 });
          }

          const history = await loadClientHistory(sql, access.onboardingId);
          return Response.json({
            access: { kind: access.kind, onboardingId: access.onboardingId, role: access.role, status: access.status, billingStatus: access.billingStatus },
            onboarding,
            checklist,
            roster,
            selections,
            exceptions,
            history,
            automation,
          });
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Portal unavailable" }, { status: 401 });
        }
      },
    },
  },
});

