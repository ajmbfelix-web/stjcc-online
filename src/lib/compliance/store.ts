import { getSql } from "../db";
import type { DriverRecord, ScreeningStatus, WebhookEvent } from "./types";

type StoredDriver = {
  id: string;
  name: string;
  cdl: string;
  test_type: DriverRecord["testType"];
  status: ScreeningStatus;
  barcode: string;
  updated_at: string;
};

type StoredEvent = {
  id: string;
  received_at: string;
  source: WebhookEvent["source"];
  path: string;
  payload: unknown;
};

function toDriver(row: StoredDriver): DriverRecord {
  return {
    id: row.id,
    name: row.name,
    cdl: row.cdl,
    testType: row.test_type,
    status: row.status,
    barcode: row.barcode,
    updatedAt: row.updated_at,
  };
}

function toEvent(row: StoredEvent): WebhookEvent {
  return {
    id: row.id,
    receivedAt: row.received_at,
    source: row.source,
    path: row.path,
    payload: row.payload,
  };
}

export async function listDrivers(accountId: string): Promise<DriverRecord[]> {
  const sql = await getSql();
  const rows = await sql.query<StoredDriver>(
    `select id, name, cdl, test_type, status, barcode, updated_at
     from compliance_drivers where account_id = $1 order by updated_at desc`,
    [accountId],
  );
  return rows.map(toDriver);
}

export async function listEvents(accountId: string): Promise<WebhookEvent[]> {
  const sql = await getSql();
  const rows = await sql.query<StoredEvent>(
    `select id, received_at, source, path, payload
     from compliance_events where account_id = $1 order by received_at desc limit 80`,
    [accountId],
  );
  return rows.map(toEvent);
}

export async function pushEvent(
  accountId: string,
  event: Omit<WebhookEvent, "id" | "receivedAt"> & { id?: string },
): Promise<WebhookEvent> {
  const record: WebhookEvent = {
    id: event.id ?? `evt_${Date.now().toString(36)}_${crypto.randomUUID().slice(0, 8)}`,
    receivedAt: new Date().toISOString(),
    source: event.source,
    path: event.path,
    payload: event.payload,
  };
  const sql = await getSql();
  await sql.query(
    `insert into compliance_events (id, account_id, source, path, payload, received_at)
     values ($1, $2, $3, $4, $5::jsonb, $6)
     on conflict (id) do nothing`,
    [record.id, accountId, record.source, record.path, JSON.stringify(record.payload), record.receivedAt],
  );
  return record;
}

export async function upsertDriver(accountId: string, driver: DriverRecord): Promise<DriverRecord> {
  const sql = await getSql();
  await sql.query(
    `insert into compliance_drivers
       (id, account_id, name, cdl, test_type, status, barcode, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (id) do update set
       account_id = excluded.account_id,
       name = excluded.name,
       cdl = excluded.cdl,
       test_type = excluded.test_type,
       status = excluded.status,
       barcode = excluded.barcode,
       updated_at = excluded.updated_at`,
    [driver.id, accountId, driver.name, driver.cdl, driver.testType, driver.status, driver.barcode, driver.updatedAt],
  );
  return driver;
}

export async function updateDriverStatus(
  accountId: string,
  matcher: { id?: string; barcode?: string; cdl?: string },
  status: ScreeningStatus,
): Promise<DriverRecord | undefined> {
  const sql = await getSql();
  const rows = await sql.query<StoredDriver>(
    `update compliance_drivers
     set status = $1, updated_at = now()
     where account_id = $2
       and (($3::text is not null and id = $3)
         or ($4::text is not null and barcode = $4)
         or ($5::text is not null and cdl = $5))
     returning id, name, cdl, test_type, status, barcode, updated_at`,
    [status, accountId, matcher.id ?? null, matcher.barcode ?? null, matcher.cdl ?? null],
  );
  return rows[0] ? toDriver(rows[0]) : undefined;
}

export async function nextPendingDriver(accountId: string): Promise<DriverRecord | undefined> {
  const sql = await getSql();
  const rows = await sql.query<StoredDriver>(
    `select id, name, cdl, test_type, status, barcode, updated_at
     from compliance_drivers
     where account_id = $1 and status in ('COLLECTION_PENDING', 'COLLECTION_COMPLETE')
     order by updated_at asc limit 1`,
    [accountId],
  );
  return rows[0] ? toDriver(rows[0]) : undefined;
}
