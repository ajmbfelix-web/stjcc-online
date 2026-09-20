import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhookSignature } from "@/lib/compliance/hmac";
import { nextPendingDriver, pushEvent, updateDriverStatus, upsertDriver } from "@/lib/compliance/store";
import type { ScreeningStatus, WebhookPayload } from "@/lib/compliance/types";
import { getLabVendorProvider } from "@/lib/vendors/adapter";

function mapStatus(input: WebhookPayload["status"]): ScreeningStatus {
  if (input === "NEGATIVE") return "CLEARED";
  if (input === "POSITIVE") return "EXCEPTION";
  if (input === "MRO_HOLD") return "MRO_HOLD";
  if (input === "COLLECTION_COMPLETE") return "COLLECTION_COMPLETE";
  if (input === "CLEARED" || input === "EXCEPTION" || input === "COLLECTION_PENDING") return input;
  return "CLEARED";
}

function mapVendorEvent(eventType: string): ScreeningStatus {
  if (eventType === "result.negative") return "CLEARED";
  if (eventType === "result.positive" || eventType === "process.exception") return "EXCEPTION";
  if (eventType === "mro.hold") return "MRO_HOLD";
  if (eventType === "collection.completed") return "COLLECTION_COMPLETE";
  return "COLLECTION_PENDING";
}

export const Route = createFileRoute("/api/v1/webhooks/lab-results")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const signature =
          request.headers.get("x-compliance-signature") ?? request.headers.get("x-webhook-signature");

        if (!verifyWebhookSignature(raw, signature)) {
          return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
        }

        let body: WebhookPayload = {};
        try {
          body = raw ? (JSON.parse(raw) as WebhookPayload) : {};
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

        const accountId = process.env.COMPLIANCE_ACCOUNT_ID ?? "SJCC-DEMO";
        const nextStatus = body.status ? mapStatus(body.status) : mapVendorEvent(parsed.eventType);
        let driver = await updateDriverStatus(
          accountId,
          { id: body.driverId ?? parsed.externalOrderId, barcode: body.barcode },
          nextStatus,
        );

        if (!driver) {
          const pending = await nextPendingDriver(accountId);
          if (pending) {
            driver = await updateDriverStatus(accountId, { id: pending.id }, nextStatus);
          }
        }

        if (!driver && parsed.externalOrderId) {
          driver = await upsertDriver(accountId, {
            id: parsed.externalOrderId,
            name: "Inbound Screening Record",
            cdl: "UNKNOWN",
            testType: "5_PANEL",
            status: nextStatus,
            barcode: body.barcode ?? `SJ-${parsed.externalOrderId.slice(-8).toUpperCase()}`,
            updatedAt: new Date().toISOString(),
          });
        }

        await pushEvent(accountId, {
          source: "WEBHOOK",
          path: "/api/v1/webhooks/lab-results",
          payload: {
            event: parsed.eventType,
            status: nextStatus,
            inbound: body,
            driver,
          },
        });

        return Response.json({ received: true, status: nextStatus });
      },
    },
  },
});
