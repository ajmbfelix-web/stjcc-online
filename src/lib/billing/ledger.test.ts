import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CATALOG, FLEET_ANNUAL_CENTS } from "./catalog.ts";
import { dailyBrief, isRefusal, paceTarget } from "./brief.ts";
import { bookSnapshot } from "./ledger.ts";

describe("published prices", () => {
  it("uses the annual membership and keeps a test margin", () => {
    assert.equal(FLEET_ANNUAL_CENTS, 29900);
    assert.equal(CATALOG.dot_drug.cents, 7300);
    assert.ok(CATALOG.dot_drug.cents - CATALOG.dot_drug.estimatedCostCents >= 1500);
    assert.equal(CATALOG.dot_alcohol.cents, 6300);
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

describe("daily brief", () => {
  it("keeps prepaid tests, open results, and owner-only Clearinghouse items apart", () => {
    assert.equal(paceTarget(10, 0.5, 3), 4);
    const brief = dailyBrief({
      pool: 10,
      quarter: 3,
      newClients: 2,
      driversAdded: 3,
      drugDraws: 1,
      alcoholDraws: 0,
      pastDueCards: 1,
      orders: [
        { status: "dispatch_pending", clearinghouse: "not_required" },
        { status: "sent", clearinghouse: "not_required" },
        { status: "exception", clearinghouse: "awaiting_owner", resultSummary: "Non-negative" },
        { status: "exception", clearinghouse: "awaiting_owner", resultSummary: "Refusal. No collection." },
        { status: "exception", clearinghouse: "recorded", resultSummary: "Non-negative" },
      ],
    });
    assert.equal(brief.paidNotSent, 1);
    assert.equal(brief.resultsWaiting, 1);
    assert.equal(brief.positives, 1);
    assert.equal(brief.refusals, 1);
    assert.equal(brief.drugExpected, 4);
    assert.equal(isRefusal({ status: "exception", reason: "refusal" }), true);
  });
});
