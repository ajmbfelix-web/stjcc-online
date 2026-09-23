import { DRIVER_MONTHLY_CENTS } from "../billing/catalog.ts";
import { bookSnapshot } from "../billing/ledger.ts";
import { dailyBrief, type BriefOrder, type DailyBrief } from "../billing/brief.ts";
import type { BookSnapshot } from "../billing/ledger.ts";
import { quarterOf, yearKey } from "../automation/policy.ts";
import { companyPace, paceRollup, type CompanyPace } from "../automation/pools.ts";
import type { Sql } from "../db.ts";

export type DeskOrder = BriefOrder & {
  id: string;
  amountCents: number;
  estimatedCostCents: number;
  paidAt: string | null;
  channel: string;
  companyName: string;
  candidateName: string;
  resultEmail: string;
  sku: string;
  createdAt: string;
};

export type DeskClient = {
  id: string;
  organizationName: string;
  contactEmail: string;
  status: string;
  billingStatus: string;
  billedDrivers: number;
  dotNumber: string;
  createdAt: string;
};

export type OwnerDesk = {
  book: BookSnapshot;
  brief: DailyBrief;
  quarter: number;
  pace: { behind: number; withPool: number };
  companyPace: CompanyPace[];
  orders: DeskOrder[];
  clients: DeskClient[];
  recentClients: Array<{ organizationName: string; createdAt: string }>;
  recentDrivers: Array<{ name: string; organizationName: string }>;
};

const WEEK = `(date_trunc('week', now() at time zone 'utc') at time zone 'utc')`;

function readServices(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return [];
  }
}

export async function loadOwnerDesk(sql: Sql, now = new Date()): Promise<OwnerDesk> {
  const quarter = quarterOf(now);
  const year = `${yearKey(now)}-Q%`;
  const [orders, seats, clients, freshClients, freshDrivers, poolRows, drawRows, orgRows, poolByAccount, drawsByAccount] = await Promise.all([
    sql.query<DeskOrder>(
      `select id, status, amount_cents as "amountCents", estimated_cost_cents as "estimatedCostCents",
              paid_at as "paidAt", channel, company_name as "companyName", candidate_name as "candidateName",
              result_email as "resultEmail", sku, reason, clearinghouse, created_at as "createdAt",
              result_summary as "resultSummary"
       from service_orders order by created_at desc`,
    ),
    sql.query<{ seats: number; pastDue: number }>(
      `select coalesce(sum(billed_driver_count), 0)::int as seats,
              count(*) filter (where billing_status = 'past_due' or status = 'suspended')::int as "pastDue"
       from client_onboarding`,
    ),
    sql.query<DeskClient>(
      `select id, organization_name as "organizationName", contact_email as "contactEmail", status,
              billing_status as "billingStatus", billed_driver_count as "billedDrivers", dot_number as "dotNumber",
              created_at as "createdAt"
       from client_onboarding order by created_at desc limit 80`,
    ),
    sql.query<{ organizationName: string; createdAt: string }>(
      `select organization_name as "organizationName", created_at as "createdAt"
       from client_onboarding where created_at >= ${WEEK} order by created_at desc limit 8`,
    ),
    sql.query<{ name: string; organizationName: string }>(
      `select d.name, coalesce(o.organization_name, 'Unassigned') as "organizationName"
       from driver_roster d
       left join client_onboarding o on o.id = d.account_id
       where d.created_at >= ${WEEK} and d.needs_testing = true
       order by d.created_at desc limit 8`,
    ),
    sql.query<{ pool: number; added: number; clients: number }>(
      `select
         (select count(*)::int from driver_roster where employment_status = 'active' and in_random_pool = true and needs_testing = true) as pool,
         (select count(*)::int from driver_roster where needs_testing = true and created_at >= ${WEEK}) as added,
         (select count(*)::int from client_onboarding where created_at >= ${WEEK}) as clients`,
    ),
    sql.query<{ drug: number; alcohol: number }>(
      `select count(*) filter (where test_kind = 'drug')::int as drug,
              count(*) filter (where test_kind = 'alcohol')::int as alcohol
       from random_selections where period like $1`,
      [`${yearKey(now)}-Q%`],
    ),
    sql.query<{ id: string; organizationName: string; services: unknown; poolMode: string; status: string }>(
      `select id, organization_name as "organizationName", services, pool_mode as "poolMode", status
       from client_onboarding
       where status in ('active', 'past_due')`,
    ),
    sql.query<{ accountId: string; pool: number }>(
      `select account_id as "accountId", count(*)::int as pool
       from driver_roster
       where employment_status = 'active' and in_random_pool = true and needs_testing = true
       group by account_id`,
    ),
    sql.query<{ accountId: string; testKind: string; drawn: number }>(
      `select account_id as "accountId", test_kind as "testKind", count(*)::int as drawn
       from random_selections
       where period like $1
       group by account_id, test_kind`,
      [year],
    ),
  ]);
  const seat = seats[0] ?? { seats: 0, pastDue: 0 };
  const counts = poolRows[0] ?? { pool: 0, added: 0, clients: 0 };
  const draws = drawRows[0] ?? { drug: 0, alcohol: 0 };
  const poolSize = new Map(poolByAccount.map((row) => [row.accountId, row.pool]));
  const drawn = new Map<string, { drug: number; alcohol: number }>();
  for (const row of drawsByAccount) {
    const current = drawn.get(row.accountId) ?? { drug: 0, alcohol: 0 };
    if (row.testKind === "alcohol") current.alcohol = row.drawn;
    else current.drug = row.drawn;
    drawn.set(row.accountId, current);
  }
  const companies = orgRows
    .map((org) =>
      companyPace({
        id: org.id,
        organizationName: org.organizationName,
        poolMode: org.poolMode,
        pool: poolSize.get(org.id) ?? 0,
        drugDraws: drawn.get(org.id)?.drug ?? 0,
        alcoholDraws: drawn.get(org.id)?.alcohol ?? 0,
        quarter,
        services: readServices(org.services),
        status: org.status,
      }),
    )
    .sort((left, right) => Number(right.behind) - Number(left.behind) || left.organizationName.localeCompare(right.organizationName));
  const rollup = paceRollup(companies);
  const book = bookSnapshot({
    seatBookCents: seat.seats * DRIVER_MONTHLY_CENTS,
    pastDueClients: seat.pastDue,
    now,
    orders,
  });
  const brief = dailyBrief({
    pool: 0,
    quarter,
    newClients: counts.clients,
    driversAdded: counts.added,
    drugDraws: draws.drug,
    alcoholDraws: draws.alcohol,
    pastDueCards: seat.pastDue,
    orders,
  });
  return {
    book,
    brief,
    quarter,
    pace: rollup,
    companyPace: companies,
    orders: orders.slice(0, 200),
    clients,
    recentClients: freshClients,
    recentDrivers: freshDrivers,
  };
}
