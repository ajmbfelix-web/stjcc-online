import { randomUUID } from "node:crypto";
import { ltsCredentialsPresent, LtsLabProvider } from "./lts.ts";

export interface OrderPayload {
  driverId: string;
  testType: string;
  orgId: string;
}

export interface ParsedWebhook {
  externalOrderId: string;
  eventType: string;
  result?: string;
}

export interface LabVendorProvider {
  createOrder(payload: OrderPayload): Promise<{
    externalOrderId: string;
    barcodeUrl: string;
  }>;
  parseWebhook(req: Request): Promise<ParsedWebhook>;
}

function assertNonEmpty(value: string, field: string): void {
  if (!value.trim()) throw new Error(`${field} is required`);
}

export class MockLabProvider implements LabVendorProvider {
  async createOrder(payload: OrderPayload) {
    assertNonEmpty(payload.driverId, "driverId");
    assertNonEmpty(payload.testType, "testType");
    assertNonEmpty(payload.orgId, "orgId");

    const externalOrderId = `mock_${randomUUID()}`;
    return {
      externalOrderId,
      barcodeUrl: `https://mock.lab.stjcc.online/barcodes/${externalOrderId}`,
    };
  }

  async parseWebhook(req: Request): Promise<ParsedWebhook> {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new Error("Invalid vendor webhook JSON");
    }

    if (!body || typeof body !== "object") throw new Error("Invalid vendor webhook payload");
    const payload = body as Record<string, unknown>;
    const externalOrderId = payload.externalOrderId ?? payload.orderId;
    const eventType = payload.eventType ?? payload.event;
    if (typeof externalOrderId !== "string" || typeof eventType !== "string") {
      throw new Error("Vendor webhook requires externalOrderId and eventType");
    }

    const normalizedEventType =
      eventType === "mro.result" && payload.status === "NEGATIVE"
        ? "result.negative"
        : eventType === "mro.result" && payload.status === "POSITIVE"
          ? "result.positive"
          : eventType;

    return {
      externalOrderId,
      eventType: normalizedEventType,
      ...(typeof payload.result === "string" ? { result: payload.result } : {}),
    };
  }
}

/** True only when LTS credentials exist. Mock must not mark an order sent. */
export function labConfigured(): boolean {
  return ltsCredentialsPresent();
}

export function getLabVendorProvider(): LabVendorProvider {
  if (ltsCredentialsPresent()) return new LtsLabProvider();
  return new MockLabProvider();
}
