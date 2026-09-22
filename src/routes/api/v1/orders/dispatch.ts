import { createFileRoute } from "@tanstack/react-router";
import { pushEvent, upsertDriver } from "@/lib/compliance/store";
import type { DriverRecord, OrderRequest, TestType } from "@/lib/compliance/types";
import { requirePortalAccess } from "@/lib/portal/access.server";
import { getLabVendorProvider } from "@/lib/vendors/adapter";

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
        const provider = getLabVendorProvider();
        const vendorOrder = await provider.createOrder({
          driverId: orderId,
          testType,
          orgId: accountId,
        });

        const driver: DriverRecord = {
          id: orderId,
          name: body.driver?.name ?? "Unnamed Driver",
          cdl: body.driver?.cdl ?? "PENDING-CDL",
          testType,
          status: "COLLECTION_PENDING",
          barcode: vendorOrder.externalOrderId,
          updatedAt: new Date().toISOString(),
        };

        await upsertDriver(accountId, driver);

        const payload = {
          accepted: true,
          accountId,
          integrationConfigured: Boolean(process.env.COMPLIANCE_API_KEY),
          order: {
            orderId,
            barcode: vendorOrder.externalOrderId,
            barcodeUrl: vendorOrder.barcodeUrl,
            externalOrderId: vendorOrder.externalOrderId,
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
