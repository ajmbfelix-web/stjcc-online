export const DRUG_ANNUAL_RATE = 0.5;
export const ALCOHOL_ANNUAL_RATE = 0.1;
export const SYSTEM_ACCOUNT_ID = "sjcc-system";

export type AccessKind = "owner" | "active_client" | "pending_client" | "unassigned";
export type Audience = "owner" | "client";
export type ScreeningStatus =
  | "COLLECTION_PENDING"
  | "COLLECTION_COMPLETE"
  | "CLEARED"
  | "MRO_HOLD"
  | "EXCEPTION";

export type Finding = {
  dedupeKey: string;
  audience: Audience;
  severity: "low" | "normal" | "high" | "critical";
  source: string;
  title: string;
  description: string;
  rosterId?: string;
  notify?: {
    recipient: string;
    template: string;
    subject: string;
    body: string;
  };
};

export type TrackingProfile = {
  medical: boolean;
  mvr: boolean;
  clearinghouse: boolean;
  random: boolean;
};

const ACTIVE_STATUSES = new Set(["active", "past_due"]);

export function classifyAccess(input: {
  isOwner: boolean;
  onboardingId?: string | null;
  status?: string | null;
}): AccessKind {
  if (input.isOwner) return "owner";
  if (!input.onboardingId) return "unassigned";
  if (input.status && ACTIVE_STATUSES.has(input.status)) return "active_client";
  return "pending_client";
}

export function quarterOf(date: Date): 1 | 2 | 3 | 4 {
  return (Math.floor(date.getUTCMonth() / 3) + 1) as 1 | 2 | 3 | 4;
}

export function periodKey(date: Date): string {
  return `${date.getUTCFullYear()}-Q${quarterOf(date)}`;
}

export function yearKey(date: Date): string {
  return String(date.getUTCFullYear());
}

export function todayUtc(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function annualTarget(poolSize: number, rate: number): number {
  if (poolSize <= 0 || rate <= 0) return 0;
  return Math.ceil(poolSize * rate - 1e-9);
}

export function selectionsDue(input: {
  poolSize: number;
  rate: number;
  alreadySelectedThisYear: number;
  quarter: number;
}): number {
  const annual = annualTarget(input.poolSize, input.rate);
  const quarter = Math.min(4, Math.max(1, input.quarter));
  const pace = Math.ceil((annual * quarter) / 4 - 1e-9);
  return Math.max(0, Math.min(annual, pace) - Math.max(0, input.alreadySelectedThisYear));
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function selectIds(ids: readonly string[], count: number, seed: string): string[] {
  if (count <= 0 || ids.length === 0) return [];
  return [...ids]
    .sort((left, right) => {
      const delta = hashString(`${seed}:${left}`) - hashString(`${seed}:${right}`);
      if (delta !== 0) return delta;
      return left < right ? -1 : left > right ? 1 : 0;
    })
    .slice(0, Math.min(count, ids.length));
}

export function planRandomDraw<T extends { id: string }>(input: {
  candidates: readonly T[];
  alreadySelectedIds: readonly string[];
  rate: number;
  quarter: number;
  seed: string;
}): T[] {
  const due = selectionsDue({
    poolSize: input.candidates.length,
    rate: input.rate,
    alreadySelectedThisYear: input.alreadySelectedIds.length,
    quarter: input.quarter,
  });
  const already = new Set(input.alreadySelectedIds);
  const eligible = input.candidates.filter((candidate) => !already.has(candidate.id));
  const chosen = new Set(selectIds(eligible.map((candidate) => candidate.id), due, input.seed));
  return eligible.filter((candidate) => chosen.has(candidate.id));
}

export function serviceList(services: unknown): string[] {
  if (!Array.isArray(services)) return [];
  return services.filter((item): item is string => typeof item === "string");
}

export function trackingProfile(services: unknown): TrackingProfile {
  const text = serviceList(services).join(" | ").toLowerCase();
  const drug = /drug and alcohol|random pool/.test(text);
  return {
    medical: /qualification|drug and alcohol|random pool/.test(text),
    mvr: /mvr/.test(text) || drug,
    clearinghouse: /clearinghouse/.test(text) || drug,
    random: drug,
  };
}

export function billingDecision(eventType: string): "activate" | "past_due" | "suspend" | "ignore" {
  if (eventType === "checkout.session.completed" || eventType === "invoice.paid") return "activate";
  if (eventType === "invoice.payment_failed") return "past_due";
  if (eventType === "customer.subscription.deleted") return "suspend";
  return "ignore";
}

export function decideLabUpdate(
  current: ScreeningStatus | null,
  incoming: ScreeningStatus,
): { action: "apply"; status: ScreeningStatus } | { action: "ignore" } | { action: "conflict" } {
  if (!current) return { action: "apply", status: incoming };
  if (current === incoming) return { action: "ignore" };
  if (current === "CLEARED") return { action: "conflict" };
  if (current === "EXCEPTION" && incoming === "CLEARED") return { action: "conflict" };
  return { action: "apply", status: incoming };
}

export function labOwnerFinding(orderId: string, driverName: string, status: ScreeningStatus): Finding | null {
  if (status === "MRO_HOLD") {
    return {
      dedupeKey: `owner:lab:${orderId}:MRO_HOLD`,
      audience: "owner",
      severity: "high",
      source: "lab",
      title: `MRO hold for ${driverName}`,
      description: "The laboratory result is waiting on medical review. The driver stays out of service until the MRO releases a final result.",
    };
  }
  if (status === "EXCEPTION") {
    return {
      dedupeKey: `owner:lab:${orderId}:EXCEPTION`,
      audience: "owner",
      severity: "critical",
      source: "lab",
      title: `Non-negative result for ${driverName}`,
      description: "The testing workflow returned a non-negative or refused result. SJCC stopped automatic clearance for this order.",
    };
  }
  return null;
}

export type ChecklistItem = {
  id: string;
  label: string;
  state: "complete" | "waiting" | "blocked";
  detail: string;
};

export function activationChecklist(input: {
  status: string;
  billingStatus: string;
  billingConfigured: boolean;
}): ChecklistItem[] {
  const agreementDone = input.status !== "in_progress";
  const billingDone = input.billingStatus === "current" || input.billingStatus === "past_due" || input.status === "active";
  const active = input.status === "active" || input.status === "past_due";
  return [
    {
      id: "organization",
      label: "Organization recorded",
      state: "complete",
      detail: "Company, DOT, contact, and service selections are on file.",
    },
    {
      id: "agreement",
      label: "Operational authorization",
      state: agreementDone ? "complete" : "waiting",
      detail: agreementDone ? "Authorization recorded." : "Agreement confirmations are still required.",
    },
    {
      id: "billing",
      label: "Billing",
      state: billingDone ? "complete" : input.billingConfigured ? "waiting" : "blocked",
      detail: billingDone
        ? "Payment method is on file."
        : input.billingConfigured
          ? "Finish Stripe checkout. Activation happens when payment is confirmed."
          : "SJCC billing is not configured yet. No one can activate this organization until that integration is restored.",
    },
    {
      id: "activation",
      label: "Portal activation",
      state: active ? "complete" : "waiting",
      detail: active
        ? input.status === "past_due"
          ? "Portal stays open. Payment failed and is already on the exception list."
          : "Workspace is active."
        : input.status === "suspended"
          ? "The subscription ended. Portal actions stay locked until billing is restored."
          : "Activation is automatic after billing confirms. No manual approval step.",
    },
  ];
}

function ageDays(today: string, date: string): number {
  const start = Date.parse(`${date}T00:00:00Z`);
  const end = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.round((end - start) / 86_400_000);
}

function daysUntil(today: string, date: string): number {
  return -ageDays(today, date);
}

function clientNotice(input: {
  dedupeKey: string;
  title: string;
  description: string;
  severity: Finding["severity"];
  source: string;
  rosterId?: string;
  recipient?: string;
  template: string;
}): Finding {
  return {
    dedupeKey: input.dedupeKey,
    audience: "client",
    severity: input.severity,
    source: input.source,
    title: input.title,
    description: input.description,
    rosterId: input.rosterId,
    ...(input.recipient
      ? {
          notify: {
            recipient: input.recipient,
            template: input.template,
            subject: input.title,
            body: input.description,
          },
        }
      : {}),
  };
}

export function qualificationFindings(input: {
  rosterId: string;
  name: string;
  recipient?: string;
  today: string;
  profile: TrackingProfile;
  medicalCardExpiresOn?: string | null;
  mvrReviewedOn?: string | null;
  clearinghouseQueriedOn?: string | null;
  hiredOn?: string | null;
}): Finding[] {
  const findings: Finding[] = [];
  const { name, rosterId, today, profile } = input;

  if (profile.medical) {
    if (!input.medicalCardExpiresOn) {
      if (!input.hiredOn || ageDays(today, input.hiredOn) >= 1) {
        findings.push(
          clientNotice({
            dedupeKey: `client:medical_missing:${rosterId}`,
            title: `Medical card missing for ${name}`,
            description: `${name} has no medical certificate expiration on file. Add the date and SJCC will track renewal automatically.`,
            severity: "normal",
            source: "qualification",
            rosterId,
            recipient: input.recipient,
            template: "medical_missing",
          }),
        );
      }
    } else {
      const remaining = daysUntil(today, input.medicalCardExpiresOn);
      if (remaining < 0) {
        findings.push({
          dedupeKey: `owner:medical_overdue:${rosterId}:${input.medicalCardExpiresOn}`,
          audience: "owner",
          severity: "critical",
          source: "qualification",
          rosterId,
          title: `Medical card expired for ${name}`,
          description: `${name}'s medical certificate expired on ${input.medicalCardExpiresOn}. Automatic dispatch clearance is stopped until a new date is recorded.`,
        });
        findings.push(
          clientNotice({
            dedupeKey: `client:medical_expired:${rosterId}:${input.medicalCardExpiresOn}`,
            title: `Renew the medical card for ${name}`,
            description: `The medical certificate expired on ${input.medicalCardExpiresOn}. Update the roster when the new card is issued.`,
            severity: "critical",
            source: "qualification",
            rosterId,
            recipient: input.recipient,
            template: "medical_expired",
          }),
        );
      } else if (remaining <= 30) {
        findings.push(
          clientNotice({
            dedupeKey: `client:medical_due:${rosterId}:${input.medicalCardExpiresOn}`,
            title: `Medical card due for ${name}`,
            description: `${name}'s medical certificate expires on ${input.medicalCardExpiresOn}. Renew it before that date.`,
            severity: remaining <= 14 ? "high" : "normal",
            source: "qualification",
            rosterId,
            recipient: input.recipient,
            template: "medical_due",
          }),
        );
      }
    }
  }

  if (profile.mvr) {
    const age = input.mvrReviewedOn ? ageDays(today, input.mvrReviewedOn) : null;
    const missingTooLong = !input.mvrReviewedOn && !!input.hiredOn && ageDays(today, input.hiredOn) > 30;
    if (age === null || age > 365) {
      findings.push(
        clientNotice({
          dedupeKey: `client:mvr_due:${rosterId}`,
          title: `Annual MVR review due for ${name}`,
          description: input.mvrReviewedOn
            ? `The last MVR review for ${name} was ${input.mvrReviewedOn}. Record the new review when it is pulled.`
            : `No MVR review date is on file for ${name}.`,
          severity: "normal",
          source: "qualification",
          rosterId,
          recipient: input.recipient,
          template: "mvr_due",
        }),
      );
      if ((age !== null && age > 395) || missingTooLong) {
        findings.push({
          dedupeKey: `owner:mvr_overdue:${rosterId}`,
          audience: "owner",
          severity: "high",
          source: "qualification",
          rosterId,
          title: `MVR review overdue for ${name}`,
          description: `${name} is past the annual motor vehicle record review window.`,
        });
      }
    }
  }

  if (profile.clearinghouse) {
    const age = input.clearinghouseQueriedOn ? ageDays(today, input.clearinghouseQueriedOn) : null;
    const missingTooLong = !input.clearinghouseQueriedOn && !!input.hiredOn && ageDays(today, input.hiredOn) > 30;
    if (age === null || age > 365) {
      findings.push(
        clientNotice({
          dedupeKey: `client:clearinghouse_due:${rosterId}`,
          title: `Clearinghouse query due for ${name}`,
          description: input.clearinghouseQueriedOn
            ? `The last Clearinghouse query for ${name} was ${input.clearinghouseQueriedOn}.`
            : `No Clearinghouse query date is on file for ${name}.`,
          severity: "normal",
          source: "qualification",
          rosterId,
          recipient: input.recipient,
          template: "clearinghouse_due",
        }),
      );
      if ((age !== null && age > 395) || missingTooLong) {
        findings.push({
          dedupeKey: `owner:clearinghouse_overdue:${rosterId}`,
          audience: "owner",
          severity: "high",
          source: "qualification",
          rosterId,
          title: `Clearinghouse query overdue for ${name}`,
          description: `${name} is past the annual Clearinghouse limited-query window.`,
        });
      }
    }
  }

  return findings;
}

export function ownerEscalations(findings: readonly Finding[], openSince: Readonly<Record<string, string>>, today: string): Finding[] {
  const escalations: Finding[] = [];
  for (const finding of findings) {
    if (finding.audience !== "client" || finding.source !== "qualification") continue;
    const since = openSince[finding.dedupeKey];
    if (!since || ageDays(today, since) < 14) continue;
    escalations.push({
      dedupeKey: `owner:stale:${finding.dedupeKey}`,
      audience: "owner",
      severity: "high",
      source: "escalation",
      rosterId: finding.rosterId,
      title: `Client action still open: ${finding.title}`,
      description: `This action has been open since ${since} without a roster update. ${finding.description}`,
    });
  }
  return escalations;
}

export function collectionFindings(input: {
  orderId: string;
  rosterId?: string | null;
  driverName: string;
  openedOn: string;
  today: string;
  recipient?: string;
  testLabel: string;
}): Finding[] {
  const age = ageDays(input.today, input.openedOn);
  const findings: Finding[] = [
    clientNotice({
      dedupeKey: `client:collection:${input.orderId}`,
      title: `${input.testLabel} collection for ${input.driverName}`,
      description: `${input.driverName} is scheduled for ${input.testLabel}. Collection stays automatic until a laboratory result arrives.`,
      severity: age >= 3 ? "high" : "normal",
      source: "random",
      rosterId: input.rosterId ?? undefined,
      recipient: input.recipient,
      template: "collection_due",
    }),
  ];
  if (age >= 7) {
    findings.push({
      dedupeKey: `owner:collection:${input.orderId}`,
      audience: "owner",
      severity: "high",
      source: "random",
      rosterId: input.rosterId ?? undefined,
      title: `Collection not completed for ${input.driverName}`,
      description: `${input.testLabel} for ${input.driverName} has been pending since ${input.openedOn}.`,
    });
  }
  return findings;
}

export function onboardingFindings(input: {
  id: string;
  organizationName: string;
  recipient?: string;
  status: string;
  createdOn: string;
  today: string;
  billingConfigured: boolean;
}): Finding[] {
  if (input.status === "active" || input.status === "past_due") return [];
  const age = ageDays(input.today, input.createdOn);
  const findings: Finding[] = [];
  if (!input.billingConfigured && (input.status === "payment_pending" || input.status === "in_progress")) {
    findings.push({
      dedupeKey: `owner:billing_unconfigured:${input.id}`,
      audience: "owner",
      severity: "critical",
      source: "billing_config",
      title: `Billing blocked for ${input.organizationName}`,
      description: "Stripe is not configured, so this organization cannot activate. Restore the billing integration. No manual approval is required after that.",
    });
  }
  if (input.billingConfigured && input.status === "payment_pending" && age >= 3) {
    findings.push(
      clientNotice({
        dedupeKey: `client:onboarding_payment:${input.id}`,
        title: `Finish billing for ${input.organizationName}`,
        description: "Checkout is still open. The workspace activates automatically after Stripe confirms payment.",
        severity: "normal",
        source: "onboarding",
        recipient: input.recipient,
        template: "billing_reminder",
      }),
    );
  }
  if (age >= 7 && input.status !== "suspended") {
    findings.push({
      dedupeKey: `owner:onboarding_stalled:${input.id}`,
      audience: "owner",
      severity: "high",
      source: "onboarding",
      title: `Onboarding stalled for ${input.organizationName}`,
      description: `${input.organizationName} has been in ${input.status.replaceAll("_", " ")} since ${input.createdOn}.`,
    });
  }
  if (input.status === "suspended") {
    findings.push({
      dedupeKey: `owner:billing_suspended:${input.id}`,
      audience: "owner",
      severity: "high",
      source: "billing",
      title: `Subscription ended for ${input.organizationName}`,
      description: "The Stripe subscription was deleted. Portal actions stay locked until billing is restored.",
    });
  }
  return findings;
}

export function needsPreEmployment(input: { hiredOn?: string | null; today: string; hasPreEmployment: boolean }): boolean {
  if (input.hasPreEmployment) return false;
  if (!input.hiredOn) return true;
  return ageDays(input.today, input.hiredOn) <= 30;
}

export function canResolveException(input: {
  kind: AccessKind;
  audience: string;
  accountId: string;
  onboardingId?: string;
}): boolean {
  if (input.kind === "owner") return true;
  return input.kind === "active_client" && input.audience === "client" && input.accountId === input.onboardingId;
}
