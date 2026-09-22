import { Resend } from "resend";

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
  const result = await resend.emails.send({ from, to, subject, text });
  if (result.error) throw new Error(result.error.message);
}

export async function sendOnboardingReceipt(to: string, onboardingId: string): Promise<void> {
  await sendOperationalEmail(
    to,
    "SJCC onboarding received",
    `Your SJCC onboarding request was received. Reference: ${onboardingId}. Use the claim code from the setup screen after you sign in. The workspace activates automatically once billing is confirmed.`,
  );
}
