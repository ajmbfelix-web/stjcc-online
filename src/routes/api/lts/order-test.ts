import { createFileRoute } from "@tanstack/react-router";
import { pushEvent, upsertDriver } from "@/lib/lts/store";
import type { DriverRecord, OrderRequest, TestType } from "@/lib/lts/types";

export const Route = createFileRoute("/api/lts/order-test")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: OrderRequest = {};
        try {
          body = (await request.json()) as OrderRequest;
        } catch {
          return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const partnerId = process.env.LTS_PARTNER_ID ?? body.partnerId ?? "STJCC-POC";
        const testType: TestType = body.testType ?? "DOT_5_PANEL";
        const orderId = `ord_${Date.now().toString(36)}`;
        const barcode = `SJ-${Math.random().toString(16).slice(2, 6).toUpperCase()}-${Math.floor(
          1000 + Math.random() * 9000,
        )}`;

        const driver: DriverRecord = {
          id: orderId,
          name: body.driver?.name ?? "Unnamed Driver",
          cdl: body.driver?.cdl ?? "PENDING-CDL",
          testType,
          status: "COLLECTION_PENDING",
          barcode,
          updatedAt: new Date().toISOString(),
        };

        upsertDriver(driver);

        const payload = {
          accepted: true,
          partnerId,
          apiKeyPresent: Boolean(process.env.LTS_API_KEY),
          order: {
            orderId,
            barcode,
            status: driver.status,
            testType,
            collectionNetwork: body.collectionNetwork ?? "QUEST_LABCORP",
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://stjcc.online"}/api/lts/webhook`,
            driver,
          },
        };

        const event = pushEvent({
          source: "ORDER_DISPATCH",
          path: "/api/lts/order-test",
          payload,
        });

        return Response.json({ ...payload, event }, { status: 201 });
      },
    },
  },
});
