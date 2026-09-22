import { createHash, randomUUID } from "node:crypto";
import { getSql } from "../db";

export type OnboardingInput = {
  organizationName: string;
  dotNumber: string;
  contactName: string;
  contactEmail: string;
  driverCount: number;
  services: string[];
};

export type OnboardingRecord = OnboardingInput & {
  id: string;
  status: string;
  createdAt: string;
};

export type AgreementAcceptanceInput = {
  onboardingId: string;
  agreementVersionId: string;
  signerName: string;
  signerEmail: string;
  termsAccepted: boolean;
  billingAuthorized: boolean;
  dataProcessingAccepted: boolean;
  ipAddress?: string;
  userAgent?: string;
};

export async function createOnboarding(input: OnboardingInput): Promise<OnboardingRecord> {
  const sql = await getSql();
  const id = `onb_${randomUUID()}`;
  const rows = await sql.query<OnboardingRecord>(
    `insert into client_onboarding
      (id, organization_name, dot_number, contact_name, contact_email, driver_count, services)
     values ($1, $2, $3, $4, lower($5), $6, $7::jsonb)
     returning id, organization_name as "organizationName", dot_number as "dotNumber",
       contact_name as "contactName", contact_email as "contactEmail", driver_count as "driverCount",
       services, status, created_at as "createdAt"`,
    [id, input.organizationName.trim(), input.dotNumber.trim(), input.contactName.trim(), input.contactEmail.trim(), input.driverCount, JSON.stringify(input.services)],
  );
  return rows[0];
}

export async function acceptAgreement(input: AgreementAcceptanceInput): Promise<void> {
  if (!input.termsAccepted || !input.billingAuthorized || !input.dataProcessingAccepted) {
    throw new Error("All agreement confirmations are required");
  }
  const sql = await getSql();
  await sql.query(
    `insert into compliance_agreement_acceptances
      (id, onboarding_id, agreement_version_id, signer_name, signer_email,
       terms_accepted, billing_authorized, data_processing_accepted, ip_address, user_agent)
     values ($1, $2, $3, $4, lower($5), $6, $7, $8, $9, $10)
     on conflict (onboarding_id, agreement_version_id) do nothing`,
    [randomUUID(), input.onboardingId, input.agreementVersionId, input.signerName.trim(), input.signerEmail.trim(), input.termsAccepted, input.billingAuthorized, input.dataProcessingAccepted, input.ipAddress ?? null, input.userAgent ?? null],
  );
  await sql.query(
    `update client_onboarding set status = 'payment_pending', updated_at = now() where id = $1`,
    [input.onboardingId],
  );
}

export async function listOnboarding(): Promise<OnboardingRecord[]> {
  const sql = await getSql();
  return sql.query<OnboardingRecord>(
    `select id, organization_name as "organizationName", dot_number as "dotNumber",
      contact_name as "contactName", contact_email as "contactEmail", driver_count as "driverCount",
      services, status, created_at as "createdAt"
     from client_onboarding order by created_at desc`,
  );
}

export async function recordStripeEvent(eventId: string, eventType: string, payload: unknown): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql.query<{ stripe_event_id: string }>(
    `insert into stripe_billing_events (stripe_event_id, event_type, payload)
     values ($1, $2, $3::jsonb) on conflict (stripe_event_id) do nothing
     returning stripe_event_id`,
    [eventId, eventType, JSON.stringify(payload)],
  );
  return Boolean(rows[0]);
}

export function agreementHash(body: string): string {
  return createHash("sha256").update(body).digest("hex");
}