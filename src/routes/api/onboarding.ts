import { createFileRoute } from "@tanstack/react-router";
import { invalidOnboardingServices } from "@/lib/billing/lts-catalog";
import { agreementBlocker, type AgreementAcceptance } from "@/lib/agreements/master";
import { renderSignedAgreement } from "@/lib/agreements/pdf.server";
import { runAutomation } from "@/lib/automation/engine";
import { newClaimToken } from "@/lib/automation/tokens";
import { acceptAgreement, createOnboarding } from "@/lib/portal/store";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe.server";
import { assertDriverPrice } from "@/lib/billing/seats.server";
import { resendConfigured, sendOnboardingReceipt, sendSignedAgreement } from "@/lib/notifications/resend.server";
import { getSessionUser } from "@/lib/auth/verify.server";
import { getSql } from "@/lib/db";

function flag(value: unknown): boolean {
  return value === true;
}

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

        const organizationName = typeof body.organizationName === "string" ? body.organizationName.trim() : "";
        const dotNumber = typeof body.dotNumber === "string" ? body.dotNumber.trim() : "";
        const contactName = typeof body.contactName === "string" ? body.contactName.trim() : "";
        const contactEmail = typeof body.contactEmail === "string" ? body.contactEmail.trim() : "";
        const driverCount = typeof body.driverCount === "number" ? body.driverCount : 0;
        const services = Array.isArray(body.services) ? body.services.filter((value): value is string => typeof value === "string") : [];
        const acceptance: AgreementAcceptance = {
          termsAccepted: flag(body.termsAccepted),
          esignConsent: flag(body.esignConsent),
          billingAuthorized: flag(body.billingAuthorized),
          complianceAcknowledged: flag(body.complianceAcknowledged),
          authorityConfirmed: flag(body.authorityConfirmed),
          signatureName: typeof body.signatureName === "string" ? body.signatureName : "",
          signerTitle: typeof body.signerTitle === "string" ? body.signerTitle : "",
        };

        if (!organizationName || !dotNumber || !contactName || !contactEmail || driverCount < 1) {
          return Response.json({ error: "Organization, contact, and at least one driver are required" }, { status: 400 });
        }
        const rejected = invalidOnboardingServices(services);
        if (rejected.length) {
          return Response.json({ error: "Choose only services Lab Testing Solutions can fulfill" }, { status: 400 });
        }
        const blocker = agreementBlocker(acceptance);
        if (blocker) return Response.json({ error: blocker }, { status: 400 });

        try {
          const claim = newClaimToken();
          const user = await getSessionUser(request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""));
          const sql = await getSql();
          const pending = await sql.query<{ id: string }>(
            `select id from client_onboarding
             where lower(contact_email) = lower($1) and dot_number = $2 and status = 'payment_pending'
               and created_at > now() - interval '2 days'
             order by created_at desc limit 1`,
            [contactEmail, dotNumber],
          );
          const onboarding = pending[0]
            ? { id: pending[0].id }
            : await createOnboarding({
                organizationName,
                dotNumber,
                contactName,
                contactEmail,
                driverCount,
                services,
                claimTokenHash: claim.hash,
                submittedByUserId: user?.id,
              });
          if (pending[0]) {
            await sql.query(
              `update client_onboarding
               set organization_name = $2, contact_name = $3, driver_count = $4, services = $5::jsonb,
                   claim_token_hash = $6, updated_at = now()
               where id = $1`,
              [onboarding.id, organizationName, contactName, driverCount, JSON.stringify(services), claim.hash],
            );
          }
          const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
          await acceptAgreement({
            ...acceptance,
            onboardingId: onboarding.id,
            signerName: contactName,
            signerEmail: contactEmail,
            ipAddress,
            userAgent: request.headers.get("user-agent") ?? undefined,
          });
          if (resendConfigured()) {
            const pdf = await renderSignedAgreement({
              organizationName,
              signerName: contactName,
              signerTitle: acceptance.signerTitle.trim(),
              signerEmail: contactEmail,
              signatureName: acceptance.signatureName.trim(),
              acceptedAt: new Date(),
              ipAddress,
            });
            await sendSignedAgreement({ signerEmail: contactEmail, organizationName, pdf });
            await sendOnboardingReceipt(contactEmail, onboarding.id);
          }
          if (user) {
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
                description: "SJCC compliance — $7 per testing driver per month, collected up front",
                metadata: { onboardingId: onboarding.id },
              },
            });
            checkoutUrl = session.url ?? undefined;
          }
          return Response.json({ onboardingId: onboarding.id, status: "payment_pending", checkoutUrl, claimToken: claim.token, agreementEmailed: resendConfigured() }, { status: 201 });
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Onboarding failed" }, { status: 400 });
        }
      },
    },
  },
});
