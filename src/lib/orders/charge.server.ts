import { requireLiveItem } from "../billing/catalog.ts";
import { getStripe, stripeConfigured } from "../billing/stripe.server.ts";
import type { Sql } from "../db.ts";
import { labConfigured, getLabVendorProvider } from "../vendors/adapter.ts";
import { markServiceOrderPaid, openServiceOrder, type ServiceOrderInput } from "./book.ts";

type Queryable = {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
};

async function sendToLab(sql: Queryable, row: { id: string; sku: string; onboardingId: string | null; complianceOrderId: string | null }): Promise<boolean> {
  if (!labConfigured()) return false;
  try {
    await getLabVendorProvider().createOrder({
      driverId: row.complianceOrderId ?? row.id,
      testType: row.sku,
      orgId: row.onboardingId ?? "walk_in",
    });
    const updated = await sql.query<{ id: string }>(
      `update service_orders set status = 'sent' where id = $1 and status in ('dispatch_pending', 'paid') returning id`,
      [row.id],
    );
    return Boolean(updated[0]);
  } catch {
    return false;
  }
}

/** Sends every paid-but-unsent order once the laboratory is connected. Safe to call every cycle. */
export async function dispatchPaidOrders(sql: Queryable): Promise<number> {
  if (!labConfigured()) return 0;
  const rows = await sql.query<{ id: string; sku: string; onboardingId: string | null; complianceOrderId: string | null }>(
    `select id, sku, onboarding_id as "onboardingId", compliance_order_id as "complianceOrderId"
     from service_orders where status in ('dispatch_pending', 'paid')`,
  );
  let sent = 0;
  for (const row of rows) {
    if (await sendToLab(sql, row)) sent += 1;
  }
  return sent;
}

export async function openAndCollect(sql: Queryable, input: ServiceOrderInput): Promise<"unpaid" | "held" | "ready"> {
  const id = await openServiceOrder(sql as Sql, input);
  const existing = await sql.query<{ id: string; status: string; sku: string; onboardingId: string | null; complianceOrderId: string | null }>(
    `select id, status, sku, onboarding_id as "onboardingId", compliance_order_id as "complianceOrderId" from service_orders where id = $1`,
    [id],
  );
  const current = existing[0];
  if (!current) return "unpaid";
  if (current.status === "sent" || current.status === "result" || current.status === "exception") return "ready";
  if (current.status === "dispatch_pending" || current.status === "paid") {
    const sent = await sendToLab(sql, current);
    return sent ? "ready" : "held";
  }
  if (!stripeConfigured() || !input.onboardingId) return "unpaid";
  const orgs = await sql.query<{ customer: string | null }>(
    `select stripe_customer_id as customer from client_onboarding where id = $1`,
    [input.onboardingId],
  );
  const customer = orgs[0]?.customer;
  if (!customer) return "unpaid";
  let item;
  try {
    item = requireLiveItem(input.sku);
  } catch {
    return "unpaid";
  }
  try {
    const stripe = getStripe();
    let invoice = await stripe.invoices.create(
      {
        customer,
        collection_method: "charge_automatically",
        auto_advance: false,
        pending_invoice_items_behavior: "exclude",
        metadata: { onboardingId: input.onboardingId, serviceOrderId: id, reason: "service_order" },
      },
      { idempotencyKey: `sjcc-${id}-invoice` },
    );
    if (invoice.status === "draft") {
      await stripe.invoiceItems.create(
        {
          customer,
          invoice: invoice.id,
          amount: item.cents,
          currency: "usd",
          description: item.label,
          metadata: { serviceOrderId: id },
        },
        { idempotencyKey: `sjcc-${id}-item` },
      );
      invoice = await stripe.invoices.finalizeInvoice(invoice.id, {}, { idempotencyKey: `sjcc-${id}-finalize` });
    }
    if (invoice.status !== "paid") {
      invoice = await stripe.invoices.pay(invoice.id, {}, { idempotencyKey: `sjcc-${id}-pay` });
    }
    if (invoice.status !== "paid") return "unpaid";
  } catch {
    return "unpaid";
  }
  await markServiceOrderPaid(sql as Sql, { id });
  const sent = await sendToLab(sql, { id, sku: input.sku, onboardingId: input.onboardingId ?? null, complianceOrderId: input.complianceOrderId ?? null });
  return sent ? "ready" : "held";
}

export async function checkoutServiceOrder(input: ServiceOrderInput & { origin: string }): Promise<{ id: string; url: string | null }> {
  const { getSql } = await import("../db.ts");
  const sql = await getSql();
  const id = await openServiceOrder(sql, input);
  const item = requireLiveItem(input.sku);
  if (!stripeConfigured()) return { id, url: null };
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: input.candidateEmail || input.resultEmail,
    line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: item.cents, product_data: { name: item.label } } }],
    success_url: `${input.origin}/screen?paid=1`,
    cancel_url: `${input.origin}/screen?cancelled=1`,
    metadata: { serviceOrderId: id, channel: input.channel },
  });
  await sql.query(`update service_orders set stripe_session_id = $2 where id = $1`, [id, session.id]);
  return { id, url: session.url };
}
