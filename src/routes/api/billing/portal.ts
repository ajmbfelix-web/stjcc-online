import { createFileRoute } from "@tanstack/react-router";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe.server";
import { getSql } from "@/lib/db";
import { requirePortalAccess } from "@/lib/portal/access.server";

export const Route = createFileRoute("/api/billing/portal")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const access = await requirePortalAccess(request);
          if ((access.kind !== "active_client" && access.kind !== "pending_client") || !access.onboardingId) {
            return Response.json({ error: "Organization billing access required" }, { status: 403 });
          }
          if (!stripeConfigured()) return Response.json({ error: "Billing is not configured" }, { status: 400 });
          const rows = await (await getSql()).query<{ stripe_customer_id: string | null }>(
            `select stripe_customer_id from client_onboarding where id = $1`,
            [access.onboardingId],
          );
          const customerId = rows[0]?.stripe_customer_id;
          if (!customerId) return Response.json({ error: "No Stripe customer is linked to this organization yet" }, { status: 400 });
          const session = await getStripe().billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin}/dashboard`,
          });
          return Response.json({ url: session.url });
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Billing portal unavailable" }, { status: 400 });
        }
      },
    },
  },
});
