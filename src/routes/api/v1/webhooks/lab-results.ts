import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhookSignature } from "@/lib/compliance/hmac";
import { nextPendingDriver, pushEvent, updateDriverStatus, upsertDriver } from "@/lib/compliance/store";
import type { ScreeningStatus, WebhookPayload } from "@/lib/compliance/types";

function mapStatus(input: WebhookPayload["status"]): ScreeningStatus {
  if (input === "NEGATIVE") return "CLEARED";
  if (input === "POSITIVE") return "EXCEPTION";
  if (input === "MRO_HOLD") return "MRO_HOLD";
  if (input === "COLLECTION_COMPLETE") return "COLLECTION_COMPLETE";
  if (input === "CLEARED" || input === "EXCEPTION" || input === "COLLECTION_PENDING") return input;
  return "CLEARED";
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

        const nextStatus = mapStatus(body.status);
        let driver = updateDriverStatus(
          { id: body.driverId ?? body.orderId, barcode: body.barcode },
          nextStatus,
        );

        if (!driver) {
          const pending = nextPendingDriver();
          if (pending) {
            driver = updateDriverStatus({ id: pending.id }, nextStatus);
          }
        }

        if (!driver && body.orderId) {
          driver = upsertDriver({
            id: body.orderId,
            name: "Inbound Screening Record",
            cdl: "UNKNOWN",
            testType: "DOT_5_PANEL",
            status: nextStatus,
            barcode: body.barcode ?? `SJ-${body.orderId.slice(-8).toUpperCase()}`,
            updatedAt: new Date().toISOString(),
          });
        }

        pushEvent({
          source: "WEBHOOK",
          path: "/api/v1/webhooks/lab-results",
          payload: {
            event: body.event ?? "mro.result",
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
