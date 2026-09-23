import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CATALOG, DRIVER_MONTHLY_CENTS } from "./catalog.ts";
import { bookSnapshot } from "./ledger.ts";

describe("published prices", () => {
  it("undercuts the per-driver programs and keeps a test margin", () => {
    assert.equal(DRIVER_MONTHLY_CENTS, 700);
    assert.ok(CATALOG.dot_drug.cents < 6900);
    assert.ok(CATALOG.dot_drug.cents - CATALOG.dot_drug.estimatedCostCents >= 1500);
    assert.ok(CATALOG.dot_alcohol.cents < 5900);
  });
});

describe("owner book", () => {
  it("holds prepaid tests out of the vendor bill until they are sent", () => {
    const book = bookSnapshot({
      seatBookCents: 1400,
      pastDueClients: 1,
      now: new Date("2026-09-22T12:00:00Z"),
      orders: [
        { status: "unpaid", amountCents: 6500, estimatedCostCents: 4800 },
        { status: "dispatch_pending", amountCents: 6500, estimatedCostCents: 4800, paidAt: "2026-09-10T00:00:00Z" },
        { status: "sent", amountCents: 5500, estimatedCostCents: 3500, paidAt: "2026-09-02T00:00:00Z" },
        { status: "sent", amountCents: 6500, estimatedCostCents: 4800, paidAt: "2026-08-02T00:00:00Z" },
      ],
    });
    assert.equal(book.awaitingCharge, 1);
    assert.equal(book.paidNotSent, 1);
    assert.equal(book.prepaidCents, 6500);
    assert.equal(book.collectedThisMonthCents, 1400 + 6500 + 5500);
    assert.equal(book.estimatedVendorCents, 3500);
    assert.equal(book.pastDueClients, 1);
  });
});
