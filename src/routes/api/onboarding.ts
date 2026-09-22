import { createFileRoute } from "@tanstack/react-router";
import { acceptAgreement, createOnboarding } from "@/lib/portal/store";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe.server";
import { resendConfigured, sendOnboardingReceipt } from "@/lib/notifications/resend.server";

export const Route = createFileRoute("/api/onboarding")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const organizationName = typeof body.organizationName === "string" ? body.organizationName : "";
        const dotNumber = typeof body.dotNumber === "string" ? body.dotNumber : "";
        const contactName = typeof body.contactName === "string" ? body.contactName : "";
        const contactEmail = typeof body.contactEmail === "string" ? body.contactEmail : "";
        const driverCount = typeof body.driverCount === "number" ? body.driverCount : 0;
        const services = Array.isArray(body.services) ? body.services.filter((value): value is string => typeof value === "string") : [];

        if (!organizationName || !dotNumber || !contactName || !contactEmail || driverCount < 0) {
          return Response.json({ error: "Complete organization and contact information is required" }, { status: 400 });
        }

        try {
          const onboarding = await createOnboarding({ organizationName, dotNumber, contactName, contactEmail, driverCount, services });
          await acceptAgreement({
            onboardingId: onboarding.id,
            agreementVersionId: "sjcc-standard-2026-09",
            signerName: contactName,
            signerEmail: contactEmail,
            termsAccepted: body.termsAccepted === true,
            billingAuthorized: body.billingAuthorized === true,
            dataProcessingAccepted: body.dataProcessingAccepted === true,
            ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
            userAgent: request.headers.get("user-agent") ?? undefined,
          });
          let checkoutUrl: string | undefined;
          if (stripeConfigured()) {
            const session = await getStripe().checkout.sessions.create({
              mode: "subscription",
              customer_email: contactEmail,
              line_items: [{ price: process.env.STRIPE_PRICE_ID as string, quantity: Math.max(1, driverCount) }],
              success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? request.url}/onboarding?complete=1`,
              cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? request.url}/onboarding?cancelled=1`,
              metadata: { onboardingId: onboarding.id, driverCount: String(driverCount) },
              subscription_data: { metadata: { onboardingId: onboarding.id } },
            });
            checkoutUrl = session.url ?? undefined;
          }
          if (resendConfigured()) {
            await sendOnboardingReceipt(contactEmail, onboarding.id);
          }
          return Response.json({ onboardingId: onboarding.id, status: "payment_pending", checkoutUrl }, { status: 201 });
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Onboarding failed" }, { status: 400 });
        }
      },
    },
  },
});