import { createFileRoute } from "@tanstack/react-router";
import { getStripe } from "@/lib/billing/stripe.server";
import { requireOwner } from "@/lib/portal/owner.server";

export const Route = createFileRoute("/api/billing/portal")({
  server: { handlers: { POST: async ({ request }) => {
    try {
      await requireOwner(request);
      const customerId = process.env.STRIPE_CUSTOMER_ID?.trim();
      if (!customerId) return Response.json({ error: "No Stripe customer is linked yet" }, { status: 400 });
      const session = await getStripe().billingPortal.sessions.create({ customer: customerId, return_url: process.env.NEXT_PUBLIC_APP_URL ?? request.url });
      return Response.json({ url: session.url });
    } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Billing portal unavailable" }, { status: 400 }); }
  } } },
});