import { randomUUID } from "node:crypto";
import { catalogItem, type Sku } from "../billing/catalog.ts";
import type { Sql } from "../db.ts";

export type ServiceOrderInput = {
  id?: string;
  onboardingId?: string | null;
  channel: "client" | "walk_in" | "staffing";
  companyName: string;
  resultEmail: string;
  candidateName: string;
  candidateEmail?: string | null;
  complianceOrderId?: string | null;
  sku: Sku;
  reason: string;
};

export async function openServiceOrder(sql: Sql, input: ServiceOrderInput): Promise<string> {
  const item = catalogItem(input.sku);
  if (!item) throw new Error("Unknown service");
  const id = input.id ?? `svc_${randomUUID()}`;
  await sql.query(
    `insert into service_orders
      (id, onboarding_id, channel, company_name, result_email, candidate_name, candidate_email,
       compliance_order_id, sku, reason, amount_cents, estimated_cost_cents, status, clearinghouse)
     values ($1, $2, $3, $4, lower($5), $6, $7, $8, $9, $10, $11, $12, 'unpaid', 'not_required')
     on conflict (id) do nothing`,
    [
      id,
      input.onboardingId ?? null,
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

export async function recordServiceResult(sql: Sql, input: { id: string; outcome: "cleared" | "exception" | "refusal"; summary: string }): Promise<{ clearinghouse: string; resultEmail: string; companyName: string; candidateName: string; sku: string } | null> {
  const rows = await sql.query<{ clearinghouse: string; resultEmail: string; companyName: string; candidateName: string; sku: string; channel: string; status: string }>(
    `select clearinghouse, result_email as "resultEmail", company_name as "companyName", candidate_name as "candidateName", sku, channel, status
     from service_orders where id = $1`,
    [input.id],
  );
  const order = rows[0];
  if (!order || order.status === "unpaid") return null;
  const item = catalogItem(order.sku);
  const refusal = input.outcome === "refusal";
  const needsOwner = (input.outcome === "exception" || refusal) && Boolean(item?.clearinghouse);
  const summary = refusal && !input.summary.toLowerCase().includes("refus") ? `Refusal. ${input.summary}` : input.summary;
  const updated = await sql.query<{ id: string }>(
    `update service_orders
     set status = $2, result_summary = $3,
         clearinghouse = case when $4 then 'awaiting_owner' else clearinghouse end
     where id = $1 and clearinghouse <> 'recorded'
     returning id`,
    [input.id, input.outcome === "cleared" ? "result" : "exception", summary.trim(), needsOwner],
  );
  if (!updated[0]) return null;
  return { ...order, clearinghouse: needsOwner ? "awaiting_owner" : order.clearinghouse };
}

export async function recordClearinghouseDecision(sql: Sql, input: { id: string; decision: "recorded" | "withheld" }): Promise<boolean> {
  const rows = await sql.query<{ id: string }>(
    `update service_orders
     set clearinghouse = $2
     where id = $1 and clearinghouse = 'awaiting_owner'
     returning id`,
    [input.id, input.decision],
  );
  return Boolean(rows[0]);
}
