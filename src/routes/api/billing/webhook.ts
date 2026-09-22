import { createFileRoute } from "@tanstack/react-router";
import { getStripe } from "@/lib/billing/stripe.server";
import { recordStripeEvent } from "@/lib/portal/store";
import { getSql } from "@/lib/db";

export const Route = createFileRoute("/api/billing/webhook")({
  server: { handlers: { POST: async ({ request }) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) return Response.json({ error: "Stripe signature required" }, { status: 400 });
    const raw = await request.text();
    let event;
    try { event = getStripe().webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET ?? ""); }
    catch { return Response.json({ error: "Invalid Stripe signature" }, { status: 400 }); }
    const firstDelivery = await recordStripeEvent(event.id, event.type, event);
    if (!firstDelivery) return Response.json({ received: true, duplicate: true });
    const object = event.data.object as { metadata?: { onboardingId?: string } };
    const onboardingId = object.metadata?.onboardingId;
    if (onboardingId) {
      const status = event.type === "checkout.session.completed" || event.type === "invoice.paid"
        ? "active"
        : event.type === "invoice.payment_failed" || event.type === "customer.subscription.deleted"
          ? "suspended"
          : undefined;
      if (status) {
        const sql = await getSql();
        await sql.query("update client_onboarding set status = $1, updated_at = now() where id = $2", [status, onboardingId]);
      }
    }
    return Response.json({ received: true });
  } } },
});