import { randomUUID } from "node:crypto";
import { ownerInbox } from "../automation/owner.ts";
import { getStripe, stripeConfigured } from "./stripe.server.ts";
import { DRIVER_MONTHLY_CENTS, money, seatDelta } from "./seats.ts";
import { seatChangeLetter } from "../notifications/letters.ts";

type Sql = {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
};

type OrgBilling = {
  billed: number;
  customer: string | null;
  subscription: string | null;
  item: string | null;
  organizationName: string;
  contactEmail: string;
};

export async function countBillableDrivers(sql: Sql, accountId: string): Promise<number> {
  const rows = await sql.query<{ count: number }>(
    `select count(*)::int as count from driver_roster
     where account_id = $1 and employment_status = 'active' and needs_testing = true`,
    [accountId],
  );
  return Number(rows[0]?.count ?? 0);
}

export async function assertDriverPrice(): Promise<void> {
  const priceId = process.env.STRIPE_PRICE_ID?.trim();
  if (!priceId) throw new Error("SJCC billing price is not configured");
  const price = await getStripe().prices.retrieve(priceId);
  if (price.unit_amount !== DRIVER_MONTHLY_CENTS || price.currency !== "usd" || price.recurring?.interval !== "month") {
    throw new Error("SJCC billing must stay at $5 per driver per month.");
  }
}

async function queueNotice(
  sql: Sql,
  accountId: string,
  input: { recipient: string; template: string; subject: string; body: string; dedupeKey: string },
): Promise<void> {
  await sql.query(
    `insert into notification_outbox (id, account_id, recipient, template, subject, body, dedupe_key)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (dedupe_key) do nothing`,
    [`ntf_${randomUUID()}`, accountId, input.recipient, input.template, input.subject, input.body, input.dedupeKey],
  );
}

async function chargeUpfront(customerId: string, onboardingId: string, cents: number, description: string): Promise<void> {
  const stripe = getStripe();
  const draft = await stripe.invoices.create({
    customer: customerId,
    collection_method: "charge_automatically",
    auto_advance: false,
    pending_invoice_items_behavior: "exclude",
    metadata: { onboardingId, reason: "driver_seat" },
  });
  await stripe.invoiceItems.create({
    customer: customerId,
    invoice: draft.id,
    amount: cents,
    currency: "usd",
    description,
    metadata: { onboardingId },
  });
  const finalized = await stripe.invoices.finalizeInvoice(draft.id);
  if (finalized.status === "paid") return;
  try {
    const paid = await stripe.invoices.pay(finalized.id);
    if (paid.status !== "paid") throw new Error("The card on file did not pay the testing seat.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "The card on file was declined.";
    throw new Error(`Payment of ${money(cents)} did not clear, so the driver was not changed. ${message}`);
  }
}

async function loadOrg(sql: Sql, accountId: string): Promise<OrgBilling> {
  const rows = await sql.query<OrgBilling>(
    `select billed_driver_count as billed, stripe_customer_id as customer, stripe_subscription_id as subscription,
            stripe_subscription_item_id as item, organization_name as "organizationName", contact_email as "contactEmail"
     from client_onboarding where id = $1`,
    [accountId],
  );
  const org = rows[0];
  if (!org) throw new Error("Organization not found");
  return org;
}

async function resolveSubscription(org: OrgBilling, onboardingId: string): Promise<OrgBilling> {
  if (!stripeConfigured() || !org.customer) return org;
  if (org.subscription && org.item) return org;
  const stripe = getStripe();
  const list = await stripe.subscriptions.list({ customer: org.customer, status: "all", limit: 10 });
  const match =
    list.data.find((sub) => sub.metadata?.onboardingId === onboardingId && ["active", "past_due", "trialing"].includes(sub.status)) ??
    list.data.find((sub) => ["active", "past_due", "trialing"].includes(sub.status));
  if (!match) return org;
  const item = match.items.data.find((entry) => entry.price.id === process.env.STRIPE_PRICE_ID) ?? match.items.data[0];
  return { ...org, subscription: match.id, item: item?.id ?? null };
}

export async function applySeatChange(
  sql: Sql,
  input: { accountId: string; before: number; after: number; driverName: string; cdl: string },
): Promise<{ chargedCents: number; billedDrivers: number; collected: boolean }> {
  const org = await resolveSubscription(await loadOrg(sql, input.accountId), input.accountId);
  const plan = seatDelta({ billed: org.billed, before: input.before, after: input.after });
  if (plan.added === 0 || (plan.chargeCents === 0 && plan.nextBilled === org.billed)) {
    return { chargedCents: 0, billedDrivers: org.billed, collected: true };
  }

  if (stripeConfigured()) {
    await assertDriverPrice();
    if (plan.chargeCents > 0) {
      if (!org.customer) throw new Error("Finish checkout before adding a testing driver. There is no card on file.");
      await chargeUpfront(
        org.customer,
        input.accountId,
        plan.chargeCents,
        `SJCC testing seat for ${input.driverName} — $5.00 paid up front`,
      );
    }
    if (org.subscription && org.item && plan.nextBilled !== org.billed) {
      const stripe = getStripe();
      await stripe.subscriptions.update(org.subscription, {
        items: [{ id: org.item, quantity: Math.max(plan.nextBilled, 1) }],
        proration_behavior: "none",
        ...(plan.nextBilled === 0 ? { pause_collection: { behavior: "void" as const } } : { pause_collection: "" as const }),
      });
    }
  } else if (plan.chargeCents > 0) {
    await queueNotice(sql, input.accountId, {
      recipient: ownerInbox(),
      template: "owner_seat_unbilled",
      subject: `Could not collect $5 for ${input.driverName}`,
      body: `${org.organizationName} added ${input.driverName} (${input.cdl}), but Stripe is not configured in this environment. The seat was recorded and the $5 charge was not collected.`,
      dedupeKey: `notify:owner:seat_unbilled:${input.accountId}:${input.cdl}`,
    });
  }

  await sql.query(`update client_onboarding set billed_driver_count = $2, updated_at = now() where id = $1`, [
    input.accountId,
    plan.nextBilled,
  ]);
  if (plan.added !== 0) {
    await queueNotice(sql, input.accountId, {
      recipient: org.contactEmail,
      template: plan.added > 0 ? "seat_added" : "seat_removed",
      subject:
        plan.chargeCents > 0
          ? `${money(plan.chargeCents)} charged for ${input.driverName}`
          : plan.added > 0
            ? `${input.driverName} assigned to a paid testing seat`
            : `${input.driverName} removed from testing`,
      body: seatChangeLetter({
        organizationName: org.organizationName,
        driverName: input.driverName,
        cdl: input.cdl,
        chargedCents: plan.chargeCents,
        billedDrivers: plan.nextBilled,
        added: plan.added,
      }),
      dedupeKey: `notify:seat:${input.accountId}:${input.cdl}:${plan.nextBilled}:${plan.added > 0 ? "add" : "remove"}`,
    });
  }
  return { chargedCents: plan.chargeCents, billedDrivers: plan.nextBilled, collected: stripeConfigured() || plan.chargeCents === 0 };
}

export async function rememberSubscription(
  sql: Sql,
  input: { onboardingId: string; customerId?: string | null; subscriptionId?: string | null },
): Promise<void> {
  if (!input.onboardingId || !stripeConfigured()) return;
  let subscriptionId = input.subscriptionId ?? null;
  let itemId: string | null = null;
  let quantity: number | null = null;
  const stripe = getStripe();
  if (!subscriptionId && input.customerId) {
    const list = await stripe.subscriptions.list({ customer: input.customerId, status: "all", limit: 10 });
    const match =
      list.data.find((sub) => sub.metadata?.onboardingId === input.onboardingId) ??
      list.data.find((sub) => ["active", "past_due", "trialing"].includes(sub.status));
    subscriptionId = match?.id ?? null;
    if (match) {
      const item = match.items.data.find((entry) => entry.price.id === process.env.STRIPE_PRICE_ID) ?? match.items.data[0];
      itemId = item?.id ?? null;
      quantity = item?.quantity ?? null;
    }
  } else if (subscriptionId) {
    const match = await stripe.subscriptions.retrieve(subscriptionId);
    const item = match.items.data.find((entry) => entry.price.id === process.env.STRIPE_PRICE_ID) ?? match.items.data[0];
    itemId = item?.id ?? null;
    quantity = item?.quantity ?? null;
  }
  await sql.query(
    `update client_onboarding
     set stripe_customer_id = coalesce($2, stripe_customer_id),
         stripe_subscription_id = coalesce($3, stripe_subscription_id),
         stripe_subscription_item_id = coalesce($4, stripe_subscription_item_id),
         billed_driver_count = case when billed_driver_count = 0 and $5::int is not null then $5 else billed_driver_count end,
         updated_at = now()
     where id = $1`,
    [input.onboardingId, input.customerId ?? null, subscriptionId, itemId, quantity],
  );
}
