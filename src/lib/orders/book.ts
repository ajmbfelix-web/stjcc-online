import { randomUUID } from "node:crypto";
import { catalogItem, type Sku } from "../billing/catalog.ts";
import { recordAudit } from "../compliance/audit.ts";
import type { Sql } from "../db.ts";

export type ServiceOrderInput = {
  id?: string;
  onboardingId?: string | null;
  rosterId?: string | null;
  channel: "client" | "walk_in" | "staffing";
  companyName: string;
  resultEmail: string;
  candidateName: string;
  candidateEmail?: string | null;
  complianceOrderId?: string | null;
  sku: Sku;
  reason: string;
  actorUserId?: string | null;
};

export async function openServiceOrder(sql: Sql, input: ServiceOrderInput): Promise<string> {
  const item = catalogItem(input.sku);
  if (!item) throw new Error("Unknown service");
  const id = input.id ?? `svc_${randomUUID()}`;
  const inserted = await sql.query<{ id: string }>(
    `insert into service_orders
      (id, onboarding_id, roster_id, channel, company_name, result_email, candidate_name, candidate_email,
       compliance_order_id, sku, reason, amount_cents, estimated_cost_cents, status, clearinghouse)
     values ($1, $2, $3, $4, $5, lower($6), $7, $8, $9, $10, $11, $12, $13, 'unpaid', 'not_required')
     on conflict (id) do nothing
     returning id`,
    [
      id,
      input.onboardingId ?? null,
      input.rosterId ?? null,
      input.channel,
      input.companyName.trim(),
      input.resultEmail.trim(),
      input.candidateName.trim(),
      input.candidateEmail?.trim() || null,
      input.complianceOrderId ?? null,
      item.sku,
      input.reason,
      item.cents,
      item.estimatedCostCents,
    ],
  );
  if (input.rosterId) {
    await sql.query(`update service_orders set roster_id = coalesce(roster_id, $2) where id = $1`, [id, input.rosterId]);
  }
  if (inserted[0]) {
    await recordAudit(sql, {
      onboardingId: input.onboardingId,
      actorUserId: input.actorUserId,
      action: "service_order_opened",
      entityType: "service_order",
      entityId: id,
      metadata: { sku: item.sku, reason: input.reason, rosterId: input.rosterId ?? null },
    });
  }
  return id;
}

export async function markServiceOrderPaid(sql: Sql, input: { id?: string; sessionId?: string }): Promise<void> {
  await sql.query(
    `update service_orders
     set status = case when status = 'unpaid' then 'dispatch_pending' else status end,
         paid_at = coalesce(paid_at, now()),
         stripe_session_id = coalesce($2, stripe_session_id)
     where ($1::text is not null and id = $1) or ($2::text is not null and stripe_session_id = $2)`,
    [input.id ?? null, input.sessionId ?? null],
  );
}

export async function recordServiceResult(
  sql: Sql,
  input: { id: string; outcome: "cleared" | "exception" | "refusal"; summary: string; actorUserId?: string | null },
): Promise<{ clearinghouse: string; resultEmail: string; companyName: string; candidateName: string; sku: string; onboardingId: string | null; rosterId: string | null } | null> {
  const rows = await sql.query<{
    clearinghouse: string;
    resultEmail: string;
    companyName: string;
    candidateName: string;
    sku: string;
    channel: string;
    status: string;
    onboardingId: string | null;
    rosterId: string | null;
  }>(
    `select clearinghouse, result_email as "resultEmail", company_name as "companyName", candidate_name as "candidateName",
            sku, channel, status, onboarding_id as "onboardingId", roster_id as "rosterId"
     from service_orders where id = $1`,
    [input.id],
  );
  const order = rows[0];
  if (!order || order.status === "unpaid") return null;
  const item = catalogItem(order.sku);
  const refusal = input.outcome === "refusal";
  const needsOwner = (input.outcome === "exception" || refusal) && Boolean(item?.clearinghouse);
  const summary = refusal && !input.summary.toLowerCase().includes("refus") ? `Refusal. ${input.summary}` : input.summary;
  let rosterId = order.rosterId;
  if (!rosterId && order.onboardingId) {
    const matches = await sql.query<{ id: string }>(
      `select id from driver_roster where account_id = $1 and lower(name) = lower($2) limit 2`,
      [order.onboardingId, order.candidateName],
    );
    if (matches.length === 1) rosterId = matches[0].id;
  }
  const updated = await sql.query<{ id: string }>(
    `update service_orders
     set status = $2, result_summary = $3, roster_id = coalesce(roster_id, $5),
         clearinghouse = case when $4 then 'awaiting_owner' else clearinghouse end
     where id = $1 and clearinghouse <> 'recorded'
     returning id`,
    [input.id, input.outcome === "cleared" ? "result" : "exception", summary.trim(), needsOwner, rosterId],
  );
  if (!updated[0]) return null;
  await recordAudit(sql, {
    onboardingId: order.onboardingId,
    actorUserId: input.actorUserId,
    action: "service_result",
    entityType: "service_order",
    entityId: input.id,
    metadata: { outcome: input.outcome, sku: order.sku, rosterId },
  });
  return { ...order, rosterId, clearinghouse: needsOwner ? "awaiting_owner" : order.clearinghouse };
}

export async function recordClearinghouseDecision(
  sql: Sql,
  input: { id: string; decision: "recorded" | "withheld"; actorUserId?: string | null },
): Promise<boolean> {
  const rows = await sql.query<{ id: string; onboardingId: string | null }>(
    `update service_orders
     set clearinghouse = $2, clearinghouse_actor_user_id = $3, clearinghouse_decided_at = now()
     where id = $1 and clearinghouse = 'awaiting_owner'
     returning id, onboarding_id as "onboardingId"`,
    [input.id, input.decision, input.actorUserId ?? null],
  );
  const row = rows[0];
  if (!row) return false;
  await recordAudit(sql, {
    onboardingId: row.onboardingId,
    actorUserId: input.actorUserId,
    action: "clearinghouse_decision",
    entityType: "service_order",
    entityId: input.id,
    metadata: { decision: input.decision },
  });
  return true;
}
