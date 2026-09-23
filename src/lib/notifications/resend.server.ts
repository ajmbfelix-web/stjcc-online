import { Resend } from "resend";
import { DRIVER_MONTHLY_CENTS, money } from "../billing/catalog.ts";
import { ownerInbox } from "../automation/owner.ts";
import { operationalLetter } from "./letters.ts";

let resendClient: Resend | null = null;

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error("Resend is not configured");
  resendClient ??= new Resend(key);
  return resendClient;
}

export function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim());
}

export async function sendOperationalEmail(to: string, subject: string, text: string): Promise<void> {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!from) throw new Error("RESEND_FROM_EMAIL is not configured");
  const result = await resend.emails.send({ from, to, subject, text: operationalLetter(text) });
  if (result.error) throw new Error(result.error.message);
}

export async function sendOnboardingReceipt(to: string, onboardingId: string): Promise<void> {
  await sendOperationalEmail(
    to,
    "SJCC onboarding received",
    `Your organization is recorded. Testing seats are ${money(DRIVER_MONTHLY_CENTS)} per driver per month. Stripe collects the first month before the portal opens. Adding a driver beyond the seats you already paid charges ${money(DRIVER_MONTHLY_CENTS)} that day.\n\nReference: ${onboardingId}\nSign in and use the claim code from the setup screen if this account is not linked yet.`,
  );
}

export async function sendSignedAgreement(input: {
  signerEmail: string;
  organizationName: string;
  pdf: Uint8Array;
}): Promise<void> {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!from) throw new Error("RESEND_FROM_EMAIL is not configured");
  const filename = "SJCC-Master-Service-Agreement.pdf";
  const content = Buffer.from(input.pdf);
  const recipients = [...new Set([ownerInbox(), input.signerEmail.trim().toLowerCase()])];
  for (const to of recipients) {
    const copy = to === ownerInbox() ? "A client signed the Master Service Agreement. The signed PDF is attached." : `${input.organizationName} signed the Master Service Agreement. Your signed copy is attached. SJCC received the same PDF.`;
    const result = await resend.emails.send({
      from,
      to,
      subject: `Signed agreement — ${input.organizationName}`,
      text: operationalLetter(`${copy}\n\nCompany: ${input.organizationName}\nSigner: ${input.signerEmail}`),
      attachments: [{ filename, content }],
    });
    if (result.error) throw new Error(result.error.message);
  }
}
