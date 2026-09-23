import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";
import { money } from "@/lib/billing/catalog";
import { briefLines } from "@/lib/billing/brief";
import { getSql } from "@/lib/db";
import { ownerInbox } from "@/lib/automation/owner";
import { resendConfigured, sendOperationalEmail } from "@/lib/notifications/resend.server";
import { loadOwnerDesk } from "@/lib/portal/desk.server";
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
  const desk = await loadOwnerDesk(sql);
  const text = [
    `SJCC book for ${day}.`,
    `Testing seats on file: ${money(desk.book.seatBookCents)}. Collected this month, including those seats: ${money(desk.book.collectedThisMonthCents)}.`,
    `Prepaid and not yet owed to the lab: ${money(desk.book.prepaidCents)}. Estimated lab cost on tests already sent this month: ${money(desk.book.estimatedVendorCents)}. Kept after that estimate: ${money(desk.book.retainedCents)}.`,
    ...briefLines(desk.brief, desk.quarter, desk.pace),
    "Nothing is filed with the Clearinghouse until you record that decision.",
  ].join("\n");
  if (resendConfigured()) await sendOperationalEmail(ownerInbox(), `SJCC Monday book ${day}`, text);
  await sql.query(
    `insert into notification_outbox (id, account_id, recipient, template, subject, body, dedupe_key, status)
     values ($1, 'sjcc', $2, 'owner_digest', $3, $4, $5, 'sent')
     on conflict (dedupe_key) do nothing`,
    [`ntf_digest_${day}`, ownerInbox(), `SJCC Monday book ${day}`, text, `owner:digest:${day}`],
  );
  return Response.json({ sent: true, book: desk.book, brief: desk.brief });
}
