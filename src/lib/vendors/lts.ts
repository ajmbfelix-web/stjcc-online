import type { LabVendorProvider, OrderPayload, ParsedWebhook } from "./adapter.ts";
import { ltsItem } from "../billing/lts-catalog.ts";

/**
 * Headless LTS adapter. SJCC places the order. LTS returns a barcode and later a result webhook.
 * The path below is a placeholder until LTS publishes the partner API. Calls happen only when
 * LAB_VENDOR=lts and a base URL plus key are set. Otherwise the platform keeps MockLabProvider
 * and leaves paid orders unsent.
 */
export class LtsLabProvider implements LabVendorProvider {
  async createOrder(payload: OrderPayload): Promise<{ externalOrderId: string; barcodeUrl: string }> {
    const base = (process.env.LTS_API_BASE_URL || process.env.LAB_API_BASE_URL || "").trim().replace(/\/$/, "");
    const key = (process.env.LTS_API_KEY || process.env.LAB_API_KEY || "").trim();
    if (!base || !key) throw new Error("LTS is not configured");
    const product = ltsItem(payload.testType);
    const response = await fetch(`${base}/v1/orders`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        productCode: product?.ltsProductCode ?? payload.testType,
        sku: payload.testType,
        driverId: payload.driverId,
        orgId: payload.orgId,
      }),
    });
    if (!response.ok) throw new Error("LTS did not accept the order");
    const body = (await response.json()) as { externalOrderId?: string; orderId?: string; barcodeUrl?: string };
    const externalOrderId = body.externalOrderId || body.orderId;
    if (!externalOrderId) throw new Error("LTS accepted the order without an id");
    return {
      externalOrderId,
      barcodeUrl: body.barcodeUrl || `${base}/barcodes/${externalOrderId}`,
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
    return {
      externalOrderId,
      eventType,
      ...(typeof payload.result === "string" ? { result: payload.result } : {}),
    };
  }
}

export function ltsCredentialsPresent(): boolean {
  const vendor = process.env.LAB_VENDOR?.trim().toLowerCase();
  const base = (process.env.LTS_API_BASE_URL || process.env.LAB_API_BASE_URL || "").trim();
  const key = (process.env.LTS_API_KEY || process.env.LAB_API_KEY || "").trim();
  if (vendor !== "lts" || !base || !key) return false;
  return ![base, key].some((value) => value === "..." || value.includes("..."));
}
