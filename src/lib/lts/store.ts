import type { DriverRecord, WebhookEvent } from "./types";

const MAX_EVENTS = 80;

const seedDrivers: DriverRecord[] = [
  {
    id: "drv_01",
    name: "Marcus Hale",
    cdl: "TX-4829103",
    testType: "DOT_5_PANEL",
    status: "COLLECTION_PENDING",
    barcode: "SJ-9F2A-4410",
    updatedAt: "2026-09-19T18:12:00.000Z",
  },
  {
    id: "drv_02",
    name: "Elena Voss",
    cdl: "OH-7712044",
    testType: "DOT_5_PANEL",
    status: "CLEARED",
    barcode: "SJ-7C18-2201",
    updatedAt: "2026-09-18T14:41:00.000Z",
  },
  {
    id: "drv_03",
    name: "James Okonkwo",
    cdl: "CA-1903382",
    testType: "BACKGROUND_CHECK",
    status: "EXCEPTION",
    barcode: "SJ-3B90-1188",
    updatedAt: "2026-09-17T09:05:00.000Z",
  },
  {
    id: "drv_04",
    name: "Priya Shah",
    cdl: "FL-5501298",
    testType: "DOT_5_PANEL",
    status: "COLLECTION_PENDING",
    barcode: "SJ-1E44-7732",
    updatedAt: "2026-09-19T16:28:00.000Z",
  },
  {
    id: "drv_05",
    name: "Robert Chen",
    cdl: "NY-8820145",
    testType: "BACKGROUND_CHECK",
    status: "CLEARED",
    barcode: "SJ-8D02-5566",
    updatedAt: "2026-09-16T21:10:00.000Z",
  },
];

const drivers: DriverRecord[] = [...seedDrivers];
const events: WebhookEvent[] = [
  {
    id: "evt_boot",
    receivedAt: new Date().toISOString(),
    source: "SYSTEM",
    path: "/api/lts/webhook",
    payload: {
      event: "listener.ready",
      partner: "stjcc",
      message: "LTS webhook listener armed. Awaiting sandbox callbacks.",
    },
  },
];

export function listDrivers(): DriverRecord[] {
  return [...drivers];
}

export function listEvents(): WebhookEvent[] {
  return [...events];
}

export function pushEvent(event: Omit<WebhookEvent, "id" | "receivedAt"> & { id?: string }): WebhookEvent {
  const record: WebhookEvent = {
    id: event.id ?? `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    receivedAt: new Date().toISOString(),
    source: event.source,
    path: event.path,
    payload: event.payload,
  };
  events.unshift(record);
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
  return record;
}

export function upsertDriver(driver: DriverRecord): DriverRecord {
  const index = drivers.findIndex((d) => d.id === driver.id);
  if (index >= 0) {
    drivers[index] = driver;
  } else {
    drivers.unshift(driver);
  }
  return driver;
}

export function updateDriverStatus(
  matcher: { id?: string; barcode?: string; cdl?: string },
  status: DriverRecord["status"],
): DriverRecord | undefined {
  const found = drivers.find(
    (d) =>
      (matcher.id && d.id === matcher.id) ||
      (matcher.barcode && d.barcode === matcher.barcode) ||
      (matcher.cdl && d.cdl === matcher.cdl),
  );
  if (!found) return undefined;
  found.status = status;
  found.updatedAt = new Date().toISOString();
  return found;
}

export function nextPendingDriver(): DriverRecord | undefined {
  return drivers.find((d) => d.status === "COLLECTION_PENDING" || d.status === "COLLECTION_COMPLETE");
}
