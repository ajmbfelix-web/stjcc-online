import type { DriverRecord, WebhookEvent } from "./types";

const MAX_EVENTS = 80;

const seedDrivers: DriverRecord[] = [
  {
    id: "drv_01",
    name: "Record A",
    cdl: "REDACTED",
    testType: "DOT_5_PANEL",
    status: "COLLECTION_PENDING",
    barcode: "INTERNAL",
    updatedAt: "2026-09-19T18:12:00.000Z",
  },
  {
    id: "drv_02",
    name: "Record B",
    cdl: "REDACTED",
    testType: "DOT_5_PANEL",
    status: "CLEARED",
    barcode: "INTERNAL",
    updatedAt: "2026-09-18T14:41:00.000Z",
  },
  {
    id: "drv_03",
    name: "Record C",
    cdl: "REDACTED",
    testType: "BACKGROUND_CHECK",
    status: "EXCEPTION",
    barcode: "INTERNAL",
    updatedAt: "2026-09-17T09:05:00.000Z",
  },
  {
    id: "drv_04",
    name: "Record D",
    cdl: "REDACTED",
    testType: "DOT_5_PANEL",
    status: "COLLECTION_PENDING",
    barcode: "INTERNAL",
    updatedAt: "2026-09-19T16:28:00.000Z",
  },
  {
    id: "drv_05",
    name: "Record E",
    cdl: "REDACTED",
    testType: "BACKGROUND_CHECK",
    status: "CLEARED",
    barcode: "INTERNAL",
    updatedAt: "2026-09-16T21:10:00.000Z",
  },
];

const drivers: DriverRecord[] = [...seedDrivers];
const events: WebhookEvent[] = [
  {
    id: "evt_boot",
    receivedAt: new Date().toISOString(),
    source: "SYSTEM",
    path: "/api/v1/webhooks/lab-results",
    payload: {
      event: "listener.ready",
      account: "stjcc",
      message: "Lab-results listener ready. Awaiting certified network callbacks.",
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
