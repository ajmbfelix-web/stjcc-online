import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { money, seatDelta } from "./seats.ts";

describe("driver seat billing", () => {
  it("uses a prepaid signup block before charging another seat", () => {
    assert.deepEqual(seatDelta({ billed: 10, before: 0, after: 1 }), { nextBilled: 10, chargeCents: 0, added: 1 });
    assert.deepEqual(seatDelta({ billed: 10, before: 10, after: 11 }), { nextBilled: 11, chargeCents: 700, added: 1 });
    assert.equal(money(700), "$7.00");
  });

  it("does not refund a seat that was already paid this month", () => {
    assert.deepEqual(seatDelta({ billed: 10, before: 10, after: 9 }), { nextBilled: 9, chargeCents: 0, added: -1 });
    assert.deepEqual(seatDelta({ billed: 10, before: 4, after: 3 }), { nextBilled: 10, chargeCents: 0, added: -1 });
  });
});
