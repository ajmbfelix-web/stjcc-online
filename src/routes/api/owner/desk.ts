import { createFileRoute } from "@tanstack/react-router";
import { DRIVER_MONTHLY_CENTS } from "@/lib/billing/catalog";
import { bookSnapshot } from "@/lib/billing/ledger";
import { getSql } from "@/lib/db";
import { requireOwner } from "@/lib/portal/owner.server";

export const Route = createFileRoute("/api/owner/desk")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireOwner(request);
          const sql = await getSql();
          const now = new Date();
          const quarter = Math.floor(now.getUTCMonth() / 3) + 1;
          const [orders, seats, clients] = await Promise.all([
            sql.query<{ status: string; amountCents: number; estimatedCostCents: number; paidAt: string | null; id: string; channel: string; companyName: string; candidateName: string; resultEmail: string; sku: string; reason: string; clearinghouse: string; createdAt: string; resultSummary: string | null }>(
              `select id, status, amount_cents as "amountCents", estimated_cost_cents as "estimatedCostCents",
                      paid_at as "paidAt", channel, company_name as "companyName", candidate_name as "candidateName",
                      result_email as "resultEmail", sku, reason, clearinghouse, created_at as "createdAt",
                      result_summary as "resultSummary"
               from service_orders order by created_at desc limit 200`,
            ),
            sql.query<{ seats: number; pastDue: number }>(
              `select coalesce(sum(billed_driver_count), 0)::int as seats,
                      count(*) filter (where billing_status = 'past_due' or status = 'suspended')::int as "pastDue"
               from client_onboarding`,
            ),
            sql.query<{ id: string; organizationName: string; contactEmail: string; status: string; billingStatus: string; billedDrivers: number; dotNumber: string }>(
              `select id, organization_name as "organizationName", contact_email as "contactEmail", status,
                      billing_status as "billingStatus", billed_driver_count as "billedDrivers", dot_number as "dotNumber"
               from client_onboarding order by created_at desc limit 80`,
            ),
          ]);
          const seat = seats[0] ?? { seats: 0, pastDue: 0 };
          const book = bookSnapshot({
            seatBookCents: seat.seats * DRIVER_MONTHLY_CENTS,
            pastDueClients: seat.pastDue,
            now,
            orders,
          });
          const drivers = seat.seats;
          return Response.json({
            book,
            quarter,
            pace: {
              drivers,
              drugExpected: Math.round(drivers * 0.5 * (quarter / 4)),
              alcoholExpected: Math.round(drivers * 0.1 * (quarter / 4)),
              drugDraws: orders.filter((order) => order.sku === "dot_drug" || order.sku === "dot_combo").length,
              alcoholDraws: orders.filter((order) => order.sku === "dot_alcohol" || order.sku === "dot_combo").length,
            },
            orders,
            clients,
          });
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Owner access required" }, { status: 403 });
        }
      },
    },
  },
});
