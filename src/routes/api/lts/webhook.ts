import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhookSignature } from "@/lib/lts/hmac";
import { nextPendingDriver, pushEvent, updateDriverStatus, upsertDriver } from "@/lib/lts/store";
import type { ScreeningStatus, WebhookPayload } from "@/lib/lts/types";

function mapStatus(input: WebhookPayload["status"]): ScreeningStatus {
  if (input === "NEGATIVE") return "CLEARED";
  if (input === "POSITIVE") return "EXCEPTION";
  if (input === "MRO_HOLD") return "MRO_HOLD";
  if (input === "COLLECTION_COMPLETE") return "COLLECTION_COMPLETE";
  if (input === "CLEARED" || input === "EXCEPTION" || input === "COLLECTION_PENDING") return input;
  return "CLEARED";
}

export const Route = createFileRoute("/api/lts/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const signature =
          request.headers.get("x-lts-signature") ?? request.headers.get("x-webhook-signature");

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
            name: "Inbound LTS Subject",
            cdl: "UNKNOWN",
            testType: "DOT_5_PANEL",
            status: nextStatus,
            barcode: body.barcode ?? `SJ-${body.orderId.slice(-8).toUpperCase()}`,
            updatedAt: new Date().toISOString(),
          });
        }

        const event = pushEvent({
          source: "WEBHOOK",
          path: "/api/lts/webhook",
          payload: {
            event: body.event ?? "mro.result",
            status: nextStatus,
            inbound: body,
            driver,
          },
        });

        return Response.json({
          received: true,
          status: nextStatus,
          driver,
          event,
        });
      },
    },
  },
});
