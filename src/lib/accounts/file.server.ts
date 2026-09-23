import { randomUUID } from "node:crypto";
import { annualTarget, quarterOf, yearKey } from "../automation/policy.ts";
import { companyPace } from "../automation/pools.ts";
import { recordAudit } from "../compliance/audit.ts";
import { scopeAcknowledge, scopeOwnerNote } from "./guards.ts";

type Sql = {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
};

export type TimelineEvent = {
  at: string;
  kind: string;
  title: string;
  detail: string;
  rosterId?: string | null;
};

function stamp(value: string | Date | null | undefined): string {
  if (!value) return new Date(0).toISOString();
  return value instanceof Date ? value.toISOString() : String(value);
}

function readServices(value: unknown): string[] {
  const parsed = typeof value === "string" ? safeJson(value) : value;
  return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return [];
  }
}

export async function loadAccountFile(sql: Sql, onboardingId: string, now = new Date()) {
  const orgs = await sql.query<{
    id: string;
    organizationName: string;
    dotNumber: string;
    contactName: string;
    contactEmail: string;
    status: string;
    billingStatus: string;
    billedDrivers: number;
    poolMode: string;
    services: unknown;
    driverCount: number;
  }>(
    `select id, organization_name as "organizationName", dot_number as "dotNumber", contact_name as "contactName",
            contact_email as "contactEmail", status, billing_status as "billingStatus",
            billed_driver_count as "billedDrivers", pool_mode as "poolMode", services, driver_count as "driverCount"
     from client_onboarding where id = $1`,
    [onboardingId],
  );
  const org = orgs[0];
  if (!org) return null;
  const year = `${yearKey(now)}-Q%`;
  const [drivers, draws, exceptions, orders, notes, audits, notices, selections] = await Promise.all([
    sql.query<{ id: string; name: string; cdl: string; hiredOn: string | null; needsTesting: boolean; inRandomPool: boolean; employmentStatus: string }>(
      `select id, name, cdl, hired_on as "hiredOn", needs_testing as "needsTesting", in_random_pool as "inRandomPool",
              employment_status as "employmentStatus"
       from driver_roster where account_id = $1 order by name`,
      [onboardingId],
    ),
    sql.query<{ testKind: string; drawn: number }>(
      `select test_kind as "testKind", count(*)::int as drawn from random_selections
       where account_id = $1 and period like $2 group by test_kind`,
      [onboardingId, year],
    ),
    sql.query<{ id: string; title: string; description: string; severity: string; source: string; createdAt: string }>(
      `select id, title, description, severity, source, created_at as "createdAt"
       from compliance_exceptions
       where account_id = $1 and resolved = false and audience = 'owner'
       order by created_at desc`,
      [onboardingId],
    ),
    sql.query<{
      id: string;
      status: string;
      sku: string;
      candidateName: string;
      reason: string;
      amountCents: number;
      clearinghouse: string;
      rosterId: string | null;
      createdAt: string;
      paidAt: string | null;
    }>(
      `select id, status, sku, candidate_name as "candidateName", reason, amount_cents as "amountCents",
              clearinghouse, roster_id as "rosterId", created_at as "createdAt", paid_at as "paidAt"
       from service_orders where onboarding_id = $1 order by created_at desc`,
      [onboardingId],
    ),
    sql.query<{ id: string; body: string; rosterId: string | null; actorUserId: string | null; createdAt: string }>(
      `select id, body, roster_id as "rosterId", actor_user_id as "actorUserId", created_at as "createdAt"
       from account_notes where onboarding_id = $1 order by created_at desc`,
      [onboardingId],
    ),
    sql.query<{ id: string; action: string; entityType: string; entityId: string | null; createdAt: string; actorUserId: string | null }>(
      `select id, action, entity_type as "entityType", entity_id as "entityId", created_at as "createdAt", actor_user_id as "actorUserId"
       from compliance_audit_events where onboarding_id = $1 order by created_at desc limit 200`,
      [onboardingId],
    ),
    sql.query<{ id: string; template: string; subject: string; status: string; createdAt: string }>(
      `select id, template, subject, status, created_at as "createdAt"
       from notification_outbox where account_id = $1 order by created_at desc limit 80`,
      [onboardingId],
    ),
    sql.query<{ id: string; rosterId: string; testKind: string; period: string; name: string; selectedAt: string }>(
      `select s.id, s.roster_id as "rosterId", s.test_kind as "testKind", s.period, r.name, s.selected_at as "selectedAt"
       from random_selections s
       join driver_roster r on r.id = s.roster_id
       where s.account_id = $1 and s.period like $2
       order by s.selected_at desc`,
      [onboardingId, year],
    ),
  ]);
  const pool = drivers.filter((driver) => driver.employmentStatus === "active" && driver.needsTesting && driver.inRandomPool).length;
  const drugDraws = draws.find((row) => row.testKind === "drug")?.drawn ?? 0;
  const alcoholDraws = draws.find((row) => row.testKind === "alcohol")?.drawn ?? 0;
  const pace = companyPace({
    id: org.id,
    organizationName: org.organizationName,
    poolMode: org.poolMode,
    pool,
    drugDraws,
    alcoholDraws,
    quarter: quarterOf(now),
    services: readServices(org.services),
    status: org.status,
  });
  const timeline: TimelineEvent[] = [
    ...audits.map((event) => ({
      at: stamp(event.createdAt),
      kind: "audit",
      title: event.action.replaceAll("_", " "),
      detail: event.entityType,
    })),
    ...orders.map((order) => ({
      at: stamp(order.createdAt),
      kind: "order",
      title: `${order.sku} · ${order.candidateName}`,
      detail: order.status,
      rosterId: order.rosterId,
    })),
    ...selections.map((row) => ({
      at: stamp(row.selectedAt),
      kind: "draw",
      title: `${row.testKind} selection · ${row.name}`,
      detail: row.period,
      rosterId: row.rosterId,
    })),
    ...notices.map((notice) => ({
      at: stamp(notice.createdAt),
      kind: "notice",
      title: notice.subject,
      detail: notice.status,
    })),
    ...notes.map((note) => ({
      at: stamp(note.createdAt),
      kind: "note",
      title: "Owner note",
      detail: note.body,
      rosterId: note.rosterId,
    })),
  ].sort((left, right) => right.at.localeCompare(left.at));
  return {
    organization: { ...org, services: readServices(org.services) },
    pace: {
      ...pace,
      drugAnnual: pace.eligible ? annualTarget(pool, 0.5) : 0,
      alcoholAnnual: pace.eligible ? annualTarget(pool, 0.1) : 0,
    },
    now: {
      exceptions,
      unpaid: orders.filter((order) => order.status === "unpaid"),
      paidNotSent: orders.filter((order) => order.status === "paid" || order.status === "dispatch_pending"),
      pastDue: org.billingStatus === "past_due" || org.status === "suspended",
      smallFleet: pace.smallFleet,
    },
    drivers,
    timeline,
    notes,
  };
}

export async function loadDriverFile(sql: Sql, onboardingId: string, rosterId: string) {
  const drivers = await sql.query<{
    id: string;
    name: string;
    cdl: string;
    hiredOn: string | null;
    needsTesting: boolean;
    inRandomPool: boolean;
    employmentStatus: string;
    accountId: string;
  }>(
    `select id, account_id as "accountId", name, cdl, hired_on as "hiredOn", needs_testing as "needsTesting",
            in_random_pool as "inRandomPool", employment_status as "employmentStatus"
     from driver_roster where id = $1 and account_id = $2`,
    [rosterId, onboardingId],
  );
  const driver = drivers[0];
  if (!driver) return null;
  const [orders, audits, selections, notes] = await Promise.all([
    sql.query(
      `select id, status, sku, reason, clearinghouse, clearinghouse_actor_user_id as "clearinghouseActorUserId",
              clearinghouse_decided_at as "clearinghouseDecidedAt", created_at as "createdAt", result_summary as "resultSummary"
       from service_orders
       where onboarding_id = $1 and roster_id = $2
       order by created_at desc`,
      [onboardingId, rosterId],
    ),
    sql.query<{ action: string; entityType: string; entityId: string | null; createdAt: string }>(
      `select action, entity_type as "entityType", entity_id as "entityId", created_at as "createdAt"
       from compliance_audit_events where onboarding_id = $1 order by created_at desc limit 200`,
      [onboardingId],
    ),
    sql.query(
      `select id, test_kind as "testKind", period, selected_at as "selectedAt"
       from random_selections where account_id = $1 and roster_id = $2 order by selected_at desc`,
      [onboardingId, rosterId],
    ),
    sql.query(
      `select id, body, created_at as "createdAt", actor_user_id as "actorUserId"
       from account_notes where onboarding_id = $1 and roster_id = $2 order by created_at desc`,
      [onboardingId, rosterId],
    ),
  ]);
  const orderIds = new Set((orders as Array<{ id: string }>).map((order) => order.id));
  const timeline: TimelineEvent[] = [
    ...(orders as Array<{ id: string; sku: string; status: string; createdAt: string }>).map((order) => ({
      at: stamp(order.createdAt),
      kind: "order",
      title: order.sku,
      detail: order.status,
      rosterId,
    })),
    ...(selections as Array<{ testKind: string; period: string; selectedAt: string }>).map((row) => ({
      at: stamp(row.selectedAt),
      kind: "draw",
      title: `${row.testKind} selection`,
      detail: row.period,
      rosterId,
    })),
    ...audits
      .filter((event) => event.entityId === rosterId || (event.entityId && orderIds.has(event.entityId)))
      .map((event) => ({
        at: stamp(event.createdAt),
        kind: "audit",
        title: event.action.replaceAll("_", " "),
        detail: event.entityType,
        rosterId,
      })),
    ...(notes as Array<{ body: string; createdAt: string }>).map((note) => ({
      at: stamp(note.createdAt),
      kind: "note",
      title: "Owner note",
      detail: note.body,
      rosterId,
    })),
  ].sort((left, right) => right.at.localeCompare(left.at));
  return { driver, orders, selections, notes, timeline };
}

export async function addAccountNote(
  sql: Sql,
  input: { onboardingId: string; rosterId?: string | null; actorUserId: string; body: string },
): Promise<{ id: string }> {
  const decision = scopeOwnerNote("owner", input.body);
  if (!decision.ok) throw new Error(decision.error);
  const id = `note_${randomUUID()}`;
  await sql.query(
    `insert into account_notes (id, onboarding_id, roster_id, actor_user_id, body) values ($1, $2, $3, $4, $5)`,
    [id, input.onboardingId, input.rosterId ?? null, input.actorUserId, decision.body],
  );
  await recordAudit(sql, {
    onboardingId: input.onboardingId,
    actorUserId: input.actorUserId,
    action: "account_note",
    entityType: "account_note",
    entityId: id,
    metadata: { rosterId: input.rosterId ?? null },
  });
  return { id };
}

export async function acknowledgeException(
  sql: Sql,
  input: { id: string; note: string; actorUserId: string; kind: "owner" },
): Promise<{ id: string; accountId: string }> {
  const decision = scopeAcknowledge(input.kind, input.note);
  if (!decision.ok) {
    const error = new Error(decision.error);
    (error as Error & { status: number }).status = decision.status;
    throw error;
  }
  const rows = await sql.query<{ id: string; accountId: string; rosterId: string | null }>(
    `update compliance_exceptions
     set resolved = true, resolved_at = now(), resolution_note = $2, resolved_by_user_id = $3
     where id = $1 and resolved = false and audience = 'owner'
     returning id, account_id as "accountId", roster_id as "rosterId"`,
    [input.id, decision.note, input.actorUserId],
  );
  const exception = rows[0];
  if (!exception) throw new Error("Exception not found");
  const org = await sql.query<{ id: string }>(`select id from client_onboarding where id = $1`, [exception.accountId]);
  if (org[0]) {
    await sql.query(
      `insert into account_notes (id, onboarding_id, roster_id, actor_user_id, body) values ($1, $2, $3, $4, $5)`,
      [`note_${randomUUID()}`, exception.accountId, exception.rosterId, input.actorUserId, decision.note],
    );
  }
  await recordAudit(sql, {
    onboardingId: exception.accountId,
    actorUserId: input.actorUserId,
    action: "exception_acknowledged",
    entityType: "compliance_exception",
    entityId: exception.id,
  });
  return { id: exception.id, accountId: exception.accountId };
}

export async function loadClientHistory(sql: Sql, onboardingId: string, now = new Date()) {
  const year = `${yearKey(now)}-Q%`;
  const [orders, notices, selections, poolRows, drawRows, orgRows] = await Promise.all([
    sql.query(
      `select id, sku, status, candidate_name as "candidateName", reason, clearinghouse, created_at as "createdAt"
       from service_orders where onboarding_id = $1 order by created_at desc`,
      [onboardingId],
    ),
    sql.query(
      `select id, subject, status, template, created_at as "createdAt"
       from notification_outbox where account_id = $1 order by created_at desc limit 40`,
      [onboardingId],
    ),
    sql.query(
      `select s.id, s.test_kind as "testKind", s.period, r.name
       from random_selections s join driver_roster r on r.id = s.roster_id
       where s.account_id = $1 and s.period = $2 order by r.name`,
      [onboardingId, `${yearKey(now)}-Q${quarterOf(now)}`],
    ),
    sql.query<{ pool: number }>(
      `select count(*)::int as pool from driver_roster
       where account_id = $1 and employment_status = 'active' and in_random_pool = true and needs_testing = true`,
      [onboardingId],
    ),
    sql.query<{ testKind: string; drawn: number }>(
      `select test_kind as "testKind", count(*)::int as drawn from random_selections
       where account_id = $1 and period like $2 group by test_kind`,
      [onboardingId, year],
    ),
    sql.query<{ services: unknown; poolMode: string; status: string; organizationName: string }>(
      `select services, pool_mode as "poolMode", status, organization_name as "organizationName" from client_onboarding where id = $1`,
      [onboardingId],
    ),
  ]);
  const org = orgRows[0];
  const pool = poolRows[0]?.pool ?? 0;
  const pace = org
    ? companyPace({
        id: onboardingId,
        organizationName: org.organizationName,
        poolMode: org.poolMode,
        pool,
        drugDraws: drawRows.find((row) => row.testKind === "drug")?.drawn ?? 0,
        alcoholDraws: drawRows.find((row) => row.testKind === "alcohol")?.drawn ?? 0,
        quarter: quarterOf(now),
        services: readServices(org.services),
        status: org.status,
      })
    : null;
  return { orders, notices, selections, pace };
}
