import { createFileRoute } from "@tanstack/react-router";
import { syncLabStatus } from "@/lib/automation/engine";
import { verifyWebhookSignature } from "@/lib/compliance/hmac";
import { pushEvent, upsertDriver } from "@/lib/compliance/store";
import type { ScreeningStatus, WebhookPayload } from "@/lib/compliance/types";
import { getSql } from "@/lib/db";
import { getLabVendorProvider } from "@/lib/vendors/adapter";

function mapStatus(input: string | undefined): ScreeningStatus | null {
  if (input === "NEGATIVE" || input === "CLEARED") return "CLEARED";
  if (input === "POSITIVE" || input === "EXCEPTION") return "EXCEPTION";
  if (input === "MRO_HOLD") return "MRO_HOLD";
  if (input === "COLLECTION_COMPLETE") return "COLLECTION_COMPLETE";
  if (input === "COLLECTION_PENDING") return "COLLECTION_PENDING";
  return null;
}

function mapVendorEvent(eventType: string): ScreeningStatus | null {
  if (eventType === "result.negative") return "CLEARED";
  if (eventType === "result.positive" || eventType === "process.exception" || eventType === "result.refused") return "EXCEPTION";
  if (eventType === "mro.hold") return "MRO_HOLD";
  if (eventType === "collection.completed") return "COLLECTION_COMPLETE";
  if (eventType === "collection.started" || eventType === "order.created") return "COLLECTION_PENDING";
  return null;
}

export const Route = createFileRoute("/api/v1/webhooks/lab-results")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const signature = request.headers.get("x-compliance-signature") ?? request.headers.get("x-webhook-signature");
        if (!verifyWebhookSignature(raw, signature)) {
          return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
        }

        let body: WebhookPayload & { accountId?: string; orgId?: string } = {};
        try {
          body = raw ? (JSON.parse(raw) as WebhookPayload & { accountId?: string; orgId?: string }) : {};
        } catch {
          return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        let parsed;
        try {
          parsed = await getLabVendorProvider().parseWebhook(
            new Request(request.url, { method: "POST", headers: request.headers, body: raw }),
          );
        } catch {
          return Response.json({ error: "Invalid vendor webhook payload" }, { status: 400 });
        }

        const accountId = body.accountId || body.orgId || process.env.COMPLIANCE_ACCOUNT_ID;
        if (!accountId) return Response.json({ error: "accountId is required" }, { status: 400 });
        const nextStatus = body.status ? mapStatus(body.status) : mapVendorEvent(parsed.eventType);
        if (!nextStatus) return Response.json({ error: "Unsupported laboratory result" }, { status: 400 });

        const sql = await getSql();
        const matched = await sql.query<{ id: string; name: string; status: ScreeningStatus }>(
          `select id, name, status from compliance_drivers
           where account_id = $1 and (($2::text is not null and id = $2) or ($3::text is not null and barcode = $3))
           limit 1`,
          [accountId, body.driverId ?? parsed.externalOrderId, body.barcode ?? null],
        );
        let driver = matched[0];
        if (!driver && parsed.externalOrderId) {
          const created = await upsertDriver(accountId, {
            id: parsed.externalOrderId,
            name: "Inbound Screening Record",
            cdl: "UNKNOWN",
            testType: "5_PANEL",
            status: "COLLECTION_PENDING",
            barcode: body.barcode ?? `SJ-${parsed.externalOrderId.slice(-8).toUpperCase()}`,
            updatedAt: new Date().toISOString(),
          });
          driver = { id: created.id, name: created.name, status: "COLLECTION_PENDING" };
        }
        if (!driver) return Response.json({ error: "No screening order matched this result" }, { status: 404 });

        const outcome = await syncLabStatus(sql, {
          accountId,
          driverId: driver.id,
          driverName: driver.name,
          current: driver.status,
          incoming: nextStatus,
        });

        await pushEvent(accountId, {
          source: "WEBHOOK",
          path: "/api/v1/webhooks/lab-results",
          payload: { event: parsed.eventType, status: outcome.status, conflict: outcome.conflict, driverId: driver.id },
        });

        return Response.json({ received: true, status: outcome.status, conflict: outcome.conflict });
      },
    },
  },
});
