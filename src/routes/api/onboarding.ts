import { createFileRoute } from "@tanstack/react-router";
import { runAutomation } from "@/lib/automation/engine";
import { newClaimToken } from "@/lib/automation/tokens";
import { acceptAgreement, createOnboarding } from "@/lib/portal/store";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe.server";
import { assertDriverPrice } from "@/lib/billing/seats.server";
import { resendConfigured, sendOnboardingReceipt } from "@/lib/notifications/resend.server";
import { getSessionUser } from "@/lib/auth/verify.server";
import { getSql } from "@/lib/db";

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

        if (!organizationName || !dotNumber || !contactName || !contactEmail || driverCount < 1) {
          return Response.json({ error: "Organization, contact, and at least one driver are required" }, { status: 400 });
        }

        try {
          const claim = newClaimToken();
          const user = await getSessionUser(request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""));
          const onboarding = await createOnboarding({
            organizationName,
            dotNumber,
            contactName,
            contactEmail,
            driverCount,
            services,
            claimTokenHash: claim.hash,
            submittedByUserId: user?.id,
          });
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
          if (user) {
            const sql = await getSql();
            await sql.query(
              `insert into client_user_access (user_id, onboarding_id) values ($1, $2) on conflict (user_id) do update set onboarding_id = excluded.onboarding_id`,
              [user.id, onboarding.id],
            );
          }
          await runAutomation({ reason: "onboarding", force: true });
          let checkoutUrl: string | undefined;
          if (stripeConfigured()) {
            await assertDriverPrice();
            const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
            const session = await getStripe().checkout.sessions.create({
              mode: "subscription",
              customer_email: contactEmail,
              payment_method_collection: "always",
              line_items: [{ price: process.env.STRIPE_PRICE_ID as string, quantity: driverCount }],
              success_url: `${origin}/onboarding?complete=1`,
              cancel_url: `${origin}/onboarding?cancelled=1`,
              metadata: { onboardingId: onboarding.id, driverCount: String(driverCount) },
              subscription_data: {
                description: "SJCC compliance — $5 per testing driver per month, collected up front",
                metadata: { onboardingId: onboarding.id },
              },
            });
            checkoutUrl = session.url ?? undefined;
          }
          if (resendConfigured()) {
            await sendOnboardingReceipt(contactEmail, onboarding.id);
          }
          return Response.json({ onboardingId: onboarding.id, status: "payment_pending", checkoutUrl, claimToken: claim.token }, { status: 201 });
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Onboarding failed" }, { status: 400 });
        }
      },
    },
  },
});