import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { money, seatDelta } from "./seats.ts";

describe("fleet membership", () => {
  it("does not charge a seat when a testing driver is added or removed", () => {
    assert.deepEqual(seatDelta({ billed: 2, before: 2, after: 3 }), { nextBilled: 2, chargeCents: 0, added: 1 });
    assert.deepEqual(seatDelta({ billed: 0, before: 2, after: 6 }), { nextBilled: 0, chargeCents: 0, added: 4 });
    assert.deepEqual(seatDelta({ billed: 2, before: 4, after: 3 }), { nextBilled: 2, chargeCents: 0, added: -1 });
    assert.equal(money(29900), "$299.00");
  });
});
