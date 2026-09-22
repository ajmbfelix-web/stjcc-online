import { applyBillingEvent } from "../automation/engine.ts";
import { getSql } from "../db.ts";
import { recordStripeEvent } from "../portal/store.ts";
import { rememberSubscription } from "./seats.server.ts";
import { getStripe } from "./stripe.server.ts";

type StripeObject = {
  metadata?: { onboardingId?: string };
  customer?: string | { id?: string };
  subscription?: string | { id?: string };
  parent?: { subscription_details?: { metadata?: { onboardingId?: string }; subscription?: string } };
  subscription_details?: { metadata?: { onboardingId?: string } };
};

function readId(value: string | { id?: string } | undefined): string | undefined {
  if (typeof value === "string") return value;
  return value?.id;
}

export async function handleStripeWebhook(request: Request): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Stripe signature required" }, { status: 400 });
  const raw = await request.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch {
    return Response.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }
  const firstDelivery = await recordStripeEvent(event.id, event.type, event);
  if (!firstDelivery) return Response.json({ received: true, duplicate: true });
  const object = event.data.object as StripeObject;
  const customerId = readId(object.customer);
  let subscriptionId = readId(object.subscription) ?? object.parent?.subscription_details?.subscription;
  let onboardingId =
    object.metadata?.onboardingId ??
    object.subscription_details?.metadata?.onboardingId ??
    object.parent?.subscription_details?.metadata?.onboardingId;
  const sql = await getSql();
  if (!onboardingId && subscriptionId) {
    try {
      const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
      onboardingId = subscription.metadata?.onboardingId;
    } catch {
      subscriptionId = subscriptionId;
    }
  }
  if (!onboardingId && (customerId || subscriptionId)) {
    const rows = await sql.query<{ id: string }>(
      `select id from client_onboarding
       where ($1::text is not null and stripe_customer_id = $1)
          or ($2::text is not null and stripe_subscription_id = $2)
       limit 1`,
      [customerId ?? null, subscriptionId ?? null],
    );
    onboardingId = rows[0]?.id;
  }
  const decision = await applyBillingEvent(sql, {
    eventType: event.type,
    onboardingId,
    customerId,
  });
  if (onboardingId) {
    try {
      await rememberSubscription(sql, { onboardingId, customerId, subscriptionId });
    } catch {
      // The billing state already changed. The next paid invoice can store the subscription id.
    }
  }
  return Response.json({ received: true, decision });
}
