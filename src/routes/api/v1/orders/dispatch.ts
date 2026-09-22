import { createFileRoute } from "@tanstack/react-router";
import { pushEvent, upsertDriver } from "@/lib/compliance/store";
import type { DriverRecord, OrderRequest, TestType } from "@/lib/compliance/types";
import { requirePortalAccess } from "@/lib/portal/access.server";
import { getLabVendorProvider, labConfigured } from "@/lib/vendors/adapter";

export const Route = createFileRoute("/api/v1/orders/dispatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let access;
        try {
          access = await requirePortalAccess(request);
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Authentication required" }, { status: 401 });
        }
        if (access.kind !== "owner" && access.kind !== "active_client") {
          return Response.json({ error: "An active organization workspace is required" }, { status: 403 });
        }

        let body: OrderRequest = {};
        try {
          body = (await request.json()) as OrderRequest;
        } catch {
          return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const accountId = access.kind === "owner" ? body.accountId : access.onboardingId;
        if (!accountId) return Response.json({ error: "accountId is required" }, { status: 400 });
        const testType: TestType = body.testType ?? "5_PANEL";
        const orderId = `ord_${Date.now().toString(36)}`;
        let externalOrderId = `SJ-${orderId.slice(-8).toUpperCase()}`;
        let barcodeUrl: string | null = null;
        let laboratory: "connected" | "pending_connection" = "pending_connection";
        if (labConfigured()) {
          try {
            const vendorOrder = await getLabVendorProvider().createOrder({
              driverId: orderId,
              testType,
              orgId: accountId,
            });
            externalOrderId = vendorOrder.externalOrderId;
            barcodeUrl = vendorOrder.barcodeUrl;
            laboratory = "connected";
          } catch {
            laboratory = "pending_connection";
          }
        }

        const driver: DriverRecord = {
          id: orderId,
          name: body.driver?.name ?? "Unnamed Driver",
          cdl: body.driver?.cdl ?? "PENDING-CDL",
          testType,
          status: "COLLECTION_PENDING",
          barcode: externalOrderId,
          updatedAt: new Date().toISOString(),
        };

        await upsertDriver(accountId, driver);

        const payload = {
          accepted: true,
          accountId,
          integrationConfigured: laboratory === "connected",
          laboratory,
          order: {
            orderId,
            barcode: externalOrderId,
            barcodeUrl,
            externalOrderId,
            status: driver.status,
            testType,
            collectionNetwork: body.collectionNetwork ?? "SAMHSA_CERTIFIED_NETWORK",
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://stjcc.online"}/api/v1/webhooks/lab-results`,
            driver,
          },
        };

        const event = await pushEvent(accountId, {
          source: "ORDER_DISPATCH",
          path: "/api/v1/orders/dispatch",
          payload,
        });

        return Response.json({ ...payload, event }, { status: 201 });
      },
    },
  },
});
