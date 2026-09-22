import { createFileRoute } from "@tanstack/react-router";
import { syncLabStatus } from "@/lib/automation/engine";
import { verifyWebhookSignature } from "@/lib/compliance/hmac";
import { pushEvent } from "@/lib/compliance/store";
import type { ScreeningStatus, WebhookPayload } from "@/lib/compliance/types";
import { getSql } from "@/lib/db";
import { MockLabProvider } from "@/lib/vendors/adapter";

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
          parsed = await new MockLabProvider().parseWebhook(
            new Request(request.url, { method: "POST", headers: request.headers, body: raw }),
          );
        } catch {
          return Response.json({ error: "Invalid vendor webhook payload" }, { status: 400 });
        }

        const nextStatus = body.status ? mapStatus(body.status) : mapVendorEvent(parsed.eventType);
        if (!nextStatus) return Response.json({ error: "Unsupported laboratory result" }, { status: 400 });

        const sql = await getSql();
        const externalId = body.driverId || body.orderId || parsed.externalOrderId;
        const barcode = body.barcode ?? null;
        const hintedAccount = body.accountId || body.orgId || null;
        const matched = await sql.query<{ id: string; account_id: string; name: string; status: ScreeningStatus }>(
          `select id, account_id, name, status from compliance_drivers
           where ($1::text is not null and (id = $1 or barcode = $1))
              or ($2::text is not null and barcode = $2)
           limit 2`,
          [externalId ?? null, barcode],
        );
        if (matched.length !== 1) return Response.json({ error: "No screening order matched this result" }, { status: 404 });
        const driver = matched[0];
        if (hintedAccount && hintedAccount !== driver.account_id) {
          return Response.json({ error: "Result does not belong to the supplied organization" }, { status: 409 });
        }
        const accountId = driver.account_id;

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
