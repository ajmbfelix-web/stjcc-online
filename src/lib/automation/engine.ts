import { randomUUID } from "node:crypto";
import { stripeConfigured } from "../billing/stripe.server.ts";
import { resendConfigured, sendOperationalEmail } from "../notifications/resend.server.ts";
import {
  ALCOHOL_ANNUAL_RATE,
  DRUG_ANNUAL_RATE,
  SYSTEM_ACCOUNT_ID,
  type Finding,
  type ScreeningStatus,
  collectionFindings,
  decideLabUpdate,
  labOwnerFinding,
  needsPreEmployment,
  onboardingFindings,
  ownerEscalations,
  periodKey,
  planRandomDraw,
  qualificationFindings,
  todayUtc,
  trackingProfile,
  yearKey,
  billingDecision,
} from "./policy.ts";
import { labConfigured } from "../vendors/adapter.ts";
import { ownerInbox } from "./owner.ts";
import { hashClaimToken } from "./tokens.ts";

type Sql = {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
};

export type RunOptions = {
  reason: string;
  force?: boolean;
  now?: Date;
};

export type RunSummary = {
  skipped: boolean;
  drugDraws: number;
  alcoholDraws: number;
  preEmploymentOrders: number;
  notificationsSent: number;
  notificationsRecorded: number;
  openOwnerExceptions: number;
};

type OrgRow = {
  id: string;
  organizationName: string;
  contactEmail: string;
  status: string;
  billingStatus: string;
  services: unknown;
  createdAt: string | Date;
};

type RosterRow = {
  id: string;
  accountId: string;
  name: string;
  cdl: string;
  medicalCardExpiresOn: string | Date | null;
  mvrReviewedOn: string | Date | null;
  clearinghouseQueriedOn: string | Date | null;
  hiredOn: string | Date | null;
  inRandomPool: boolean;
  needsTesting: boolean;
  employmentStatus: string;
};

type PendingOrder = {
  id: string;
  accountId: string;
  name: string;
  cdl: string;
  rosterId: string | null;
  orderReason: string;
  createdAt: string | Date;
};

const MANAGED_SOURCES = ["qualification", "escalation", "random", "onboarding", "billing_config"];

function dateOnly(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function servicesOf(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return [];
    }
  }
  return value;
}

async function upsertFinding(sql: Sql, accountId: string, finding: Finding): Promise<void> {
  const notice =
    finding.audience === "owner" && !finding.notify
      ? {
          recipient: ownerInbox(),
          template: `owner_${finding.source}`,
          subject: finding.title,
          body: `${finding.description}\n\nThis is an exception. It needs a person because the automatic step could not finish it.`,
        }
      : finding.notify;
  await sql.query(
    `insert into compliance_exceptions
      (id, account_id, title, description, severity, source, audience, dedupe_key, roster_id)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     on conflict (dedupe_key) do update set
       account_id = excluded.account_id,
       title = excluded.title,
       description = excluded.description,
       severity = excluded.severity,
       source = excluded.source,
       audience = excluded.audience,
       roster_id = excluded.roster_id,
       resolved = false,
       resolved_at = null,
       created_at = case when compliance_exceptions.resolved then now() else compliance_exceptions.created_at end`,
    [
      `exc_${randomUUID()}`,
      accountId,
      finding.title,
      finding.description,
      finding.severity,
      finding.source,
      finding.audience,
      finding.dedupeKey,
      finding.rosterId ?? null,
    ],
  );
  if (!notice?.recipient) return;
  await sql.query(
    `insert into notification_outbox
      (id, account_id, recipient, template, subject, body, dedupe_key)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (dedupe_key) do nothing`,
    [
      `ntf_${randomUUID()}`,
      accountId,
      notice.recipient,
      notice.template,
      notice.subject,
      notice.body,
      `notify:${finding.dedupeKey}`,
    ],
  );
}

async function reconcile(sql: Sql, accountId: string, findings: Finding[]): Promise<void> {
  for (const finding of findings) await upsertFinding(sql, accountId, finding);
  const sourcePlaceholders = MANAGED_SOURCES.map((_, index) => `$${index + 2}`).join(", ");
  const keyOffset = 2 + MANAGED_SOURCES.length;
  const keyClause = findings.length
    ? `and dedupe_key not in (${findings.map((_, index) => `$${keyOffset + index}`).join(", ")})`
    : "";
  await sql.query(
    `update compliance_exceptions
     set resolved = true, resolved_at = now()
     where account_id = $1
       and resolved = false
       and source in (${sourcePlaceholders})
       ${keyClause}`,
    [accountId, ...MANAGED_SOURCES, ...findings.map((finding) => finding.dedupeKey)],
  );
}

async function resolveKeys(sql: Sql, accountId: string, keys: string[]): Promise<void> {
  if (!keys.length) return;
  const placeholders = keys.map((_, index) => `$${index + 2}`).join(", ");
  await sql.query(
    `update compliance_exceptions
     set resolved = true, resolved_at = now()
     where account_id = $1 and resolved = false and dedupe_key in (${placeholders})`,
    [accountId, ...keys],
  );
}

async function insertOrder(
  sql: Sql,
  input: {
    accountId: string;
    rosterId: string;
    name: string;
    cdl: string;
    testType: "5_PANEL" | "BAT";
    orderReason: string;
  },
): Promise<PendingOrder> {
  const id = `ord_${randomUUID()}`;
  const createdAt = new Date().toISOString();
  await sql.query(
    `insert into compliance_drivers
      (id, account_id, name, cdl, test_type, status, barcode, roster_id, order_reason, updated_at)
     values ($1, $2, $3, $4, $5, 'COLLECTION_PENDING', $6, $7, $8, $9)`,
    [id, input.accountId, input.name, input.cdl, input.testType, `SJ-${id.slice(-8).toUpperCase()}`, input.rosterId, input.orderReason, createdAt],
  );
  await sql.query(
    `insert into compliance_events (id, account_id, source, path, payload)
     values ($1, $2, 'SYSTEM', 'automation', $3::jsonb)`,
    [randomUUID(), input.accountId, JSON.stringify({ orderId: id, reason: input.orderReason, rosterId: input.rosterId })],
  );
  return { id, accountId: input.accountId, name: input.name, cdl: input.cdl, rosterId: input.rosterId, orderReason: input.orderReason, createdAt };
}

async function deliverPending(sql: Sql, summary: RunSummary): Promise<void> {
  if (!resendConfigured()) {
    const recorded = await sql.query<{ id: string }>(
      `update notification_outbox
       set status = 'recorded', error = 'email channel not configured'
       where status = 'pending'
       returning id`,
    );
    summary.notificationsRecorded += recorded.length;
    await upsertFinding(sql, SYSTEM_ACCOUNT_ID, {
      dedupeKey: "owner:email_unconfigured",
      audience: "owner",
      severity: "high",
      source: "integration",
      title: "Operational email is not configured",
      description: "Notices are recorded in SJCC, but Resend is not configured so they are not leaving the platform.",
    });
    return;
  }

  await resolveKeys(sql, SYSTEM_ACCOUNT_ID, ["owner:email_unconfigured"]);
  const pending = await sql.query<{ id: string; recipient: string; subject: string; body: string; dedupe_key: string; account_id: string }>(
    `select id, recipient, subject, body, dedupe_key, account_id
     from notification_outbox where status = 'pending' order by created_at asc limit 25`,
  );
  for (const notice of pending) {
    try {
      await sendOperationalEmail(notice.recipient, notice.subject, notice.body);
      await sql.query(`update notification_outbox set status = 'sent', sent_at = now(), error = null where id = $1`, [notice.id]);
      summary.notificationsSent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Email send failed";
      await sql.query(`update notification_outbox set status = 'failed', error = $2 where id = $1`, [notice.id, message]);
      await upsertFinding(sql, notice.account_id || SYSTEM_ACCOUNT_ID, {
        dedupeKey: `owner:email_failed:${notice.dedupe_key}`,
        audience: "owner",
        severity: "high",
        source: "integration",
        title: "Operational email failed",
        description: `SJCC could not send "${notice.subject}" to ${notice.recipient}. ${message}`,
      });
    }
  }
}

export async function runAutomationWith(sql: Sql, options: RunOptions): Promise<RunSummary> {
  const now = options.now ?? new Date();
  const today = todayUtc(now);
  const summary: RunSummary = {
    skipped: false,
    drugDraws: 0,
    alcoholDraws: 0,
    preEmploymentOrders: 0,
    notificationsSent: 0,
    notificationsRecorded: 0,
    openOwnerExceptions: 0,
  };

  if (options.reason === "portal" && !options.force) {
    const recent = await sql.query<{ id: string }>(
      `select id from automation_runs
       where reason = 'portal' and finished_at is not null and started_at > now() - interval '10 minutes'
       limit 1`,
    );
    if (recent[0]) {
      summary.skipped = true;
      return summary;
    }
  }

  const runId = `run_${randomUUID()}`;
  await sql.query(`insert into automation_runs (id, reason) values ($1, $2)`, [runId, options.reason]);

  const orgs = await sql.query<OrgRow>(
    `select id, organization_name as "organizationName", contact_email as "contactEmail", status,
            billing_status as "billingStatus", services, created_at as "createdAt"
     from client_onboarding`,
  );
  const roster = await sql.query<RosterRow>(
    `select id, account_id as "accountId", name, cdl,
            medical_card_expires_on as "medicalCardExpiresOn",
            mvr_reviewed_on as "mvrReviewedOn",
            clearinghouse_queried_on as "clearinghouseQueriedOn",
            hired_on as "hiredOn",
            in_random_pool as "inRandomPool",
            needs_testing as "needsTesting",
            employment_status as "employmentStatus"
     from driver_roster
     where employment_status = 'active'`,
  );
  const preEmployment = new Set(
    (
      await sql.query<{ roster_id: string }>(
        `select distinct roster_id from compliance_drivers where order_reason = 'pre_employment' and roster_id is not null`,
      )
    ).map((row) => row.roster_id),
  );
  const pending = await sql.query<PendingOrder>(
    `select id, account_id as "accountId", name, cdl, roster_id as "rosterId", order_reason as "orderReason", created_at as "createdAt"
     from compliance_drivers where status = 'COLLECTION_PENDING'`,
  );
  const selected = await sql.query<{ rosterId: string; testKind: string }>(
    `select roster_id as "rosterId", test_kind as "testKind" from random_selections where period like $1`,
    [`${yearKey(now)}-Q%`],
  );
  const openClient = await sql.query<{ dedupeKey: string; createdAt: string | Date; accountId: string }>(
    `select dedupe_key as "dedupeKey", created_at as "createdAt", account_id as "accountId"
     from compliance_exceptions
     where resolved = false and audience = 'client' and source = 'qualification'`,
  );

  const orgById = new Map(orgs.map((org) => [org.id, org]));
  const findingsByAccount = new Map<string, Finding[]>();
  const ensure = (accountId: string) => {
    const current = findingsByAccount.get(accountId) ?? [];
    findingsByAccount.set(accountId, current);
    return current;
  };

  const billingReady = stripeConfigured();
  for (const org of orgs) {
    ensure(org.id).push(
      ...onboardingFindings({
        id: org.id,
        organizationName: org.organizationName,
        recipient: org.contactEmail,
        status: org.status,
        createdOn: dateOnly(org.createdAt) ?? today,
        today,
        billingConfigured: billingReady,
      }),
    );
  }

  const openSinceByAccount = new Map<string, Record<string, string>>();
  for (const row of openClient) {
    const bucket = openSinceByAccount.get(row.accountId) ?? {};
    const since = dateOnly(row.createdAt);
    if (since) bucket[row.dedupeKey] = since;
    openSinceByAccount.set(row.accountId, bucket);
  }

  for (const driver of roster) {
    const org = orgById.get(driver.accountId);
    if (!org || (org.status !== "active" && org.status !== "past_due") || driver.needsTesting === false) continue;
    const profile = trackingProfile(servicesOf(org.services));
    const qualification = qualificationFindings({
      rosterId: driver.id,
      name: driver.name,
      recipient: org.contactEmail,
      today,
      profile,
      medicalCardExpiresOn: dateOnly(driver.medicalCardExpiresOn),
      mvrReviewedOn: dateOnly(driver.mvrReviewedOn),
      clearinghouseQueriedOn: dateOnly(driver.clearinghouseQueriedOn),
      hiredOn: dateOnly(driver.hiredOn),
    });
    const bucket = ensure(driver.accountId);
    bucket.push(...qualification);
    bucket.push(...ownerEscalations(qualification, openSinceByAccount.get(driver.accountId) ?? {}, today));

    if (
      profile.random &&
      needsPreEmployment({
        hiredOn: dateOnly(driver.hiredOn),
        today,
        hasPreEmployment: preEmployment.has(driver.id),
      })
    ) {
      const order = await insertOrder(sql, {
        accountId: driver.accountId,
        rosterId: driver.id,
        name: driver.name,
        cdl: driver.cdl,
        testType: "5_PANEL",
        orderReason: "pre_employment",
      });
      pending.push(order);
      preEmployment.add(driver.id);
      summary.preEmploymentOrders += 1;
    }
  }

  const randomPool = roster.filter((driver) => {
    const org = orgById.get(driver.accountId);
    if (!org || (org.status !== "active" && org.status !== "past_due") || driver.inRandomPool === false || driver.needsTesting === false) return false;
    return trackingProfile(servicesOf(org.services)).random;
  });
  const quarter = Number(periodKey(now).slice(-1));
  const draws: Array<{ driver: RosterRow; kind: "drug" | "alcohol" }> = [];
  for (const kind of ["drug", "alcohol"] as const) {
    const chosen = planRandomDraw({
      candidates: randomPool,
      alreadySelectedIds: selected.filter((row) => row.testKind === kind).map((row) => row.rosterId),
      rate: kind === "drug" ? DRUG_ANNUAL_RATE : ALCOHOL_ANNUAL_RATE,
      quarter,
      seed: `${yearKey(now)}:${kind}`,
    });
    for (const driver of chosen) draws.push({ driver, kind });
  }

  for (const draw of draws) {
    const period = periodKey(now);
    const selectionId = `sel_${draw.kind}_${period}_${draw.driver.id}`;
    const orderId = `ord_${selectionId}`;
    const inserted = await sql.query<{ id: string }>(
      `insert into random_selections (id, account_id, roster_id, period, test_kind, order_id)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (account_id, period, roster_id, test_kind) do nothing
       returning id`,
      [selectionId, draw.driver.accountId, draw.driver.id, period, draw.kind, orderId],
    );
    if (!inserted[0]) continue;
    await sql.query(
      `insert into compliance_drivers
        (id, account_id, name, cdl, test_type, status, barcode, roster_id, order_reason, updated_at)
       values ($1, $2, $3, $4, $5, 'COLLECTION_PENDING', $6, $7, $8, now())
       on conflict (id) do nothing`,
      [
        orderId,
        draw.driver.accountId,
        draw.driver.name,
        draw.driver.cdl,
        draw.kind === "alcohol" ? "BAT" : "5_PANEL",
        `SJ-${orderId.slice(-8).toUpperCase()}`,
        draw.driver.id,
        draw.kind === "alcohol" ? "random_alcohol" : "random_drug",
      ],
    );
    pending.push({
      id: orderId,
      accountId: draw.driver.accountId,
      name: draw.driver.name,
      cdl: draw.driver.cdl,
      rosterId: draw.driver.id,
      orderReason: draw.kind,
      createdAt: now.toISOString(),
    });
    if (draw.kind === "drug") summary.drugDraws += 1;
    else summary.alcoholDraws += 1;
  }

  for (const order of pending) {
    const org = orgById.get(order.accountId);
    const label =
      order.orderReason === "random_alcohol"
        ? "Random alcohol test"
        : order.orderReason === "pre_employment"
          ? "Pre-employment drug test"
          : order.orderReason === "random_drug"
            ? "Random drug test"
            : "Drug test";
    ensure(order.accountId).push(
      ...collectionFindings({
        orderId: order.id,
        rosterId: order.rosterId,
        driverName: order.name,
        cdl: order.cdl,
        organizationName: org?.organizationName,
        laboratoryConnected: labConfigured(),
        openedOn: dateOnly(order.createdAt) ?? today,
        today,
        recipient: org?.contactEmail,
        testLabel: label,
      }),
    );
  }

  const accounts = new Set<string>([...orgs.map((org) => org.id), ...findingsByAccount.keys()]);
  for (const accountId of accounts) {
    await reconcile(sql, accountId, findingsByAccount.get(accountId) ?? []);
  }

  await deliverPending(sql, summary);
  const open = await sql.query<{ count: number }>(
    `select count(*)::int as count from compliance_exceptions where resolved = false and audience = 'owner'`,
  );
  summary.openOwnerExceptions = Number(open[0]?.count ?? 0);
  await sql.query(`update automation_runs set finished_at = now(), summary = $2::jsonb where id = $1`, [runId, JSON.stringify(summary)]);
  return summary;
}

export async function runAutomation(options: RunOptions): Promise<RunSummary> {
  const { getSql } = await import("../db.ts");
  return runAutomationWith(await getSql(), options);
}

export async function syncLabStatus(
  sql: Sql,
  input: { accountId: string; driverId: string; driverName: string; current: ScreeningStatus; incoming: ScreeningStatus },
): Promise<{ status: ScreeningStatus; conflict: boolean }> {
  const decision = decideLabUpdate(input.current, input.incoming);
  if (decision.action === "ignore") return { status: input.current, conflict: false };
  if (decision.action === "conflict") {
    await upsertFinding(sql, input.accountId, {
      dedupeKey: `owner:lab_conflict:${input.driverId}`,
      audience: "owner",
      severity: "critical",
      source: "lab_conflict",
      title: `Result conflict for ${input.driverName}`,
      description: `A laboratory update tried to change ${input.driverName} from ${input.current} to ${input.incoming}. The stored result was left unchanged.`,
    });
    return { status: input.current, conflict: true };
  }

  await sql.query(
    `update compliance_drivers set status = $1, updated_at = now() where id = $2 and account_id = $3`,
    [decision.status, input.driverId, input.accountId],
  );
  const ownerFinding = labOwnerFinding(input.driverId, input.driverName, decision.status);
  if (ownerFinding) await upsertFinding(sql, input.accountId, ownerFinding);
  if (decision.status === "CLEARED" || decision.status === "COLLECTION_COMPLETE") {
    await resolveKeys(sql, input.accountId, [
      `owner:lab:${input.driverId}:MRO_HOLD`,
      `owner:lab:${input.driverId}:EXCEPTION`,
      `client:collection:${input.driverId}`,
      `owner:collection:${input.driverId}`,
    ]);
  }
  return { status: decision.status, conflict: false };
}

export async function applyBillingEvent(
  sql: Sql,
  input: { eventType: string; onboardingId?: string; customerId?: string | null },
): Promise<"activate" | "past_due" | "suspend" | "ignore"> {
  const decision = billingDecision(input.eventType);
  if (!input.onboardingId || decision === "ignore") return decision;
  if (input.customerId) {
    await sql.query(`update client_onboarding set stripe_customer_id = $1, updated_at = now() where id = $2`, [
      input.customerId,
      input.onboardingId,
    ]);
  }
  const rows = await sql.query<{ organizationName: string; contactEmail: string }>(
    `select organization_name as "organizationName", contact_email as "contactEmail" from client_onboarding where id = $1`,
    [input.onboardingId],
  );
  const org = rows[0];
  if (!org) return decision;

  if (decision === "activate") {
    await sql.query(
      `update client_onboarding
       set status = 'active', billing_status = 'current', activated_at = coalesce(activated_at, now()),
           billed_driver_count = case when billed_driver_count = 0 then driver_count else billed_driver_count end,
           updated_at = now()
       where id = $1`,
      [input.onboardingId],
    );
    await sql.query(
      `insert into client_user_access (user_id, onboarding_id, role)
       select id, $1, 'client_admin' from "user" where lower(email) = lower($2)
       on conflict (user_id) do nothing`,
      [input.onboardingId, org.contactEmail],
    );
    await resolveKeys(sql, input.onboardingId, [
      `owner:billing_past_due:${input.onboardingId}`,
      `owner:billing_suspended:${input.onboardingId}`,
      `owner:billing_unconfigured:${input.onboardingId}`,
      `owner:onboarding_stalled:${input.onboardingId}`,
    ]);
    await upsertFinding(sql, input.onboardingId, {
      dedupeKey: `client:activated:${input.onboardingId}`,
      audience: "client",
      severity: "low",
      source: "onboarding",
      title: `${org.organizationName} is active`,
      description: "Billing is confirmed. The compliance workspace is open and routine work now runs automatically.",
      notify: {
        recipient: org.contactEmail,
        template: "activated",
        subject: `${org.organizationName} is active on SJCC`,
        body: "Billing is confirmed. Sign in to the client portal. Random selections, expiration tracking, and result handling now run without a manual approval step.",
      },
    });
  }

  if (decision === "past_due") {
    await sql.query(`update client_onboarding set billing_status = 'past_due', updated_at = now() where id = $1`, [input.onboardingId]);
    await upsertFinding(sql, input.onboardingId, {
      dedupeKey: `owner:billing_past_due:${input.onboardingId}`,
      audience: "owner",
      severity: "high",
      source: "billing",
      title: `Payment failed for ${org.organizationName}`,
      description: "Stripe reported a failed invoice. The portal stays open. SJCC will suspend access only if the subscription itself ends.",
      notify: {
        recipient: org.contactEmail,
        template: "payment_failed",
        subject: `Payment failed for ${org.organizationName}`,
        body: "Stripe could not collect the SJCC subscription. Update the card on file. Compliance tracking stays on while the subscription is still active.",
      },
    });
  }

  if (decision === "suspend") {
    await sql.query(
      `update client_onboarding set status = 'suspended', billing_status = 'canceled', updated_at = now() where id = $1`,
      [input.onboardingId],
    );
    await upsertFinding(sql, input.onboardingId, {
      dedupeKey: `owner:billing_suspended:${input.onboardingId}`,
      audience: "owner",
      severity: "critical",
      source: "billing",
      title: `Subscription ended for ${org.organizationName}`,
      description: "The Stripe subscription was deleted. Portal actions are locked until billing is restored.",
      notify: {
        recipient: org.contactEmail,
        template: "suspended",
        subject: `${org.organizationName} portal access is paused`,
        body: "The SJCC subscription ended. Sign in to review the account. Operational actions stay locked until billing is restored.",
      },
    });
  }

  return decision;
}

export async function claimOrganization(sql: Sql, input: { userId: string; token: string }): Promise<{ onboardingId: string } | null> {
  const rows = await sql.query<{ id: string }>(
    `select id from client_onboarding where claim_token_hash = $1`,
    [hashClaimToken(input.token.trim())],
  );
  const onboardingId = rows[0]?.id;
  if (!onboardingId) return null;
  const existing = await sql.query<{ onboarding_id: string }>(
    `select onboarding_id from client_user_access where user_id = $1`,
    [input.userId],
  );
  if (existing[0] && existing[0].onboarding_id !== onboardingId) {
    throw new Error("This account is already linked to another organization");
  }
  await sql.query(
    `insert into client_user_access (user_id, onboarding_id, role)
     values ($1, $2, 'client_admin')
     on conflict (user_id) do nothing`,
    [input.userId, onboardingId],
  );
  return { onboardingId };
}

export async function saveRosterDriver(
  sql: Sql,
  accountId: string,
  input: {
    name: string;
    cdl: string;
    medicalCardExpiresOn?: string | null;
    mvrReviewedOn?: string | null;
    clearinghouseQueriedOn?: string | null;
    hiredOn?: string | null;
    inRandomPool?: boolean;
    needsTesting?: boolean;
  },
): Promise<{ id: string }> {
  const cdl = input.cdl.trim().toUpperCase();
  const needsTesting = input.needsTesting !== false;
  const rows = await sql.query<{ id: string }>(
    `insert into driver_roster
      (id, account_id, name, cdl, medical_card_expires_on, mvr_reviewed_on, clearinghouse_queried_on, hired_on, in_random_pool, needs_testing, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
     on conflict (account_id, cdl) do update set
       name = excluded.name,
       medical_card_expires_on = excluded.medical_card_expires_on,
       mvr_reviewed_on = excluded.mvr_reviewed_on,
       clearinghouse_queried_on = excluded.clearinghouse_queried_on,
       hired_on = excluded.hired_on,
       in_random_pool = excluded.in_random_pool,
       needs_testing = excluded.needs_testing,
       employment_status = 'active',
       updated_at = now()
     returning id`,
    [
      `drv_${randomUUID()}`,
      accountId,
      input.name.trim(),
      cdl,
      input.medicalCardExpiresOn || null,
      input.mvrReviewedOn || null,
      input.clearinghouseQueriedOn || null,
      input.hiredOn || null,
      needsTesting && input.inRandomPool !== false,
      needsTesting,
    ],
  );
  const id = rows[0]?.id;
  if (!id) throw new Error("Roster update failed");
  return { id };
}
