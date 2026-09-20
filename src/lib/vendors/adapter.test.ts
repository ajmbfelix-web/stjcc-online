import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MockLabProvider } from "./adapter.ts";

describe("MockLabProvider", () => {
  it("creates a provider-neutral order", async () => {
    const provider = new MockLabProvider();
    const order = await provider.createOrder({
      driverId: "driver-1",
      testType: "5_PANEL",
      orgId: "org-1",
    });

    assert.match(order.externalOrderId, /^mock_/);
    assert.equal(
      order.barcodeUrl,
      `https://mock.lab.stjcc.online/barcodes/${order.externalOrderId}`,
    );
  });

  it("normalizes webhook payloads at the adapter boundary", async () => {
    const provider = new MockLabProvider();
    const parsed = await provider.parseWebhook(
      new Request("https://stjcc.online/webhook", {
        method: "POST",
        body: JSON.stringify({
          externalOrderId: "mock_123",
          eventType: "result.negative",
          result: "Negative",
        }),
      }),
    );

    assert.deepEqual(parsed, {
      externalOrderId: "mock_123",
      eventType: "result.negative",
      result: "Negative",
    });
  });
});