import { createHash, randomUUID } from "node:crypto";
import { AGREEMENT_TITLE, AGREEMENT_VERSION, AGREEMENT_VERSION_ID, agreementBlocker, masterAgreementBody, type AgreementAcceptance } from "../agreements/master";
import { getSql } from "../db";

export type OnboardingInput = {
  organizationName: string;
  dotNumber: string;
  contactName: string;
  contactEmail: string;
  driverCount: number;
  services: string[];
  claimTokenHash: string;
  submittedByUserId?: string;
};

export type OnboardingRecord = OnboardingInput & {
  id: string;
  status: string;
  createdAt: string;
};

export type AgreementAcceptanceInput = AgreementAcceptance & {
  onboardingId: string;
  signerName: string;
  signerEmail: string;
  ipAddress?: string;
  userAgent?: string;
};

export async function createOnboarding(input: OnboardingInput): Promise<OnboardingRecord> {
  const sql = await getSql();
  const id = `onb_${randomUUID()}`;
  const rows = await sql.query<OnboardingRecord>(
    `insert into client_onboarding
      (id, organization_name, dot_number, contact_name, contact_email, driver_count, services, claim_token_hash, submitted_by_user_id)
     values ($1, $2, $3, $4, lower($5), $6, $7::jsonb, $8, $9)
     returning id, organization_name as "organizationName", dot_number as "dotNumber",
       contact_name as "contactName", contact_email as "contactEmail", driver_count as "driverCount",
       services, status, created_at as "createdAt"`,
    [
      id,
      input.organizationName.trim(),
      input.dotNumber.trim(),
      input.contactName.trim(),
      input.contactEmail.trim(),
      input.driverCount,
      JSON.stringify(input.services),
      input.claimTokenHash,
      input.submittedByUserId ?? null,
    ],
  );
  return rows[0];
}

export async function ensureAgreementVersion(): Promise<void> {
  const sql = await getSql();
  const body = masterAgreementBody();
  await sql.query(
    `insert into compliance_agreement_versions (id, version, title, body, body_hash, active)
     values ($1, $2, $3, $4, $5, true)
     on conflict (id) do update
       set version = excluded.version, title = excluded.title, body = excluded.body,
           body_hash = excluded.body_hash, active = true`,
    [AGREEMENT_VERSION_ID, AGREEMENT_VERSION, AGREEMENT_TITLE, body, agreementHash(body)],
  );
  await sql.query(`update compliance_agreement_versions set active = false where id <> $1`, [AGREEMENT_VERSION_ID]);
}

export async function acceptAgreement(input: AgreementAcceptanceInput): Promise<void> {
  const blocker = agreementBlocker(input);
  if (blocker) throw new Error(blocker);
  const sql = await getSql();
  await ensureAgreementVersion();
  await sql.query(
    `insert into compliance_agreement_acceptances
      (id, onboarding_id, agreement_version_id, signer_name, signer_email, signer_title, signature_name,
       terms_accepted, billing_authorized, data_processing_accepted, esign_consent, compliance_acknowledged,
       authority_confirmed, ip_address, user_agent)
     values ($1, $2, $3, $4, lower($5), $6, $7, true, true, true, true, true, true, $8, $9)
     on conflict (onboarding_id, agreement_version_id) do update
       set signer_name = excluded.signer_name, signer_email = excluded.signer_email,
           signer_title = excluded.signer_title, signature_name = excluded.signature_name,
           terms_accepted = true, billing_authorized = true, data_processing_accepted = true,
           esign_consent = true, compliance_acknowledged = true, authority_confirmed = true,
           ip_address = excluded.ip_address, user_agent = excluded.user_agent, accepted_at = now()`,
    [
      randomUUID(),
      input.onboardingId,
      AGREEMENT_VERSION_ID,
      input.signerName.trim(),
      input.signerEmail.trim(),
      input.signerTitle.trim(),
      input.signatureName.trim(),
      input.ipAddress ?? null,
      input.userAgent ?? null,
    ],
  );
  await sql.query(
    `update client_onboarding set status = 'payment_pending', updated_at = now() where id = $1 and status = 'in_progress'`,
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
