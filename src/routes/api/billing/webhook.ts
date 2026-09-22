import { createFileRoute } from "@tanstack/react-router";
import { applyBillingEvent } from "@/lib/automation/engine";
import { getStripe } from "@/lib/billing/stripe.server";
import { getSql } from "@/lib/db";
import { recordStripeEvent } from "@/lib/portal/store";

export const Route = createFileRoute("/api/billing/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
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
        const object = event.data.object as { metadata?: { onboardingId?: string }; customer?: string | { id?: string } };
        const customer = object.customer;
        const customerId = typeof customer === "string" ? customer : customer?.id;
        const decision = await applyBillingEvent(await getSql(), {
          eventType: event.type,
          onboardingId: object.metadata?.onboardingId,
          customerId,
        });
        return Response.json({ received: true, decision });
      },
    },
  },
});
