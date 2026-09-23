import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";
import { DRIVER_MONTHLY_CENTS, money } from "@/lib/billing/catalog";
import { bookSnapshot } from "@/lib/billing/ledger";
import { getSql } from "@/lib/db";
import { ownerInbox } from "@/lib/automation/owner";
import { resendConfigured, sendOperationalEmail } from "@/lib/notifications/resend.server";
import { getPortalAccess } from "@/lib/portal/access.server";

function secretMatches(provided: string | null, expected: string | undefined): boolean {
  const value = expected?.trim();
  if (!value || !provided) return false;
  const left = Buffer.from(provided);
  const right = Buffer.from(value);
  return left.length === right.length && timingSafeEqual(left, right);
}

export const Route = createFileRoute("/api/v1/owner/digest")({
  server: {
    handlers: {
      GET: ({ request }) => sendDigest(request),
      POST: ({ request }) => sendDigest(request),
    },
  },
});

async function sendDigest(request: Request): Promise<Response> {
  const access = await getPortalAccess(request);
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  const allowed = access?.kind === "owner" || secretMatches(bearer, process.env.CRON_SECRET) || secretMatches(bearer, process.env.AUTOMATION_SECRET);
  if (!allowed) return Response.json({ error: "Owner authentication required" }, { status: 403 });
  const sql = await getSql();
  const day = new Date().toISOString().slice(0, 10);
  const seen = await sql.query<{ id: string }>(`select id from notification_outbox where dedupe_key = $1 limit 1`, [`owner:digest:${day}`]);
  if (seen[0]) return Response.json({ sent: false, duplicate: true });
  const orders = await sql.query<{ status: string; amountCents: number; estimatedCostCents: number; paidAt: string | null }>(
    `select status, amount_cents as "amountCents", estimated_cost_cents as "estimatedCostCents", paid_at as "paidAt" from service_orders`,
  );
  const seats = await sql.query<{ seats: number; pastDue: number; active: number }>(
    `select coalesce(sum(billed_driver_count), 0)::int as seats,
            count(*) filter (where billing_status = 'past_due' or status = 'suspended')::int as "pastDue",
            count(*) filter (where status = 'active')::int as active
     from client_onboarding`,
  );
  const seat = seats[0] ?? { seats: 0, pastDue: 0, active: 0 };
  const book = bookSnapshot({ seatBookCents: seat.seats * DRIVER_MONTHLY_CENTS, pastDueClients: seat.pastDue, now: new Date(), orders });
  const waiting = await sql.query<{ count: number }>(`select count(*)::int as count from service_orders where clearinghouse = 'awaiting_owner'`);
  const text = [
    `Monday book for ${day}.`,
    `Active clients: ${seat.active}. Testing seats on file: ${seat.seats} (${money(book.seatBookCents)}).`,
    `Collected this month, including seats: ${money(book.collectedThisMonthCents)}.`,
    `Prepaid tests not yet sent to the lab: ${book.paidNotSent} (${money(book.prepaidCents)}).`,
    `Estimated lab cost on tests sent this month: ${money(book.estimatedVendorCents)}.`,
    `Kept after that estimate: ${money(book.retainedCents)}.`,
    `Cards needing attention: ${book.pastDueClients}. Tests waiting on a charge: ${book.awaitingCharge}.`,
    `Clearinghouse reports waiting for your decision: ${waiting[0]?.count ?? 0}. Nothing is filed until you record it.`,
  ].join("\n");
  if (resendConfigured()) await sendOperationalEmail(ownerInbox(), `SJCC Monday book ${day}`, text);
  await sql.query(
    `insert into notification_outbox (id, account_id, recipient, template, subject, body, dedupe_key, status)
     values ($1, 'sjcc', $2, 'owner_digest', $3, $4, $5, 'sent')
     on conflict (dedupe_key) do nothing`,
    [`ntf_digest_${day}`, ownerInbox(), `SJCC Monday book ${day}`, text, `owner:digest:${day}`],
  );
  return Response.json({ sent: true, book });
}
