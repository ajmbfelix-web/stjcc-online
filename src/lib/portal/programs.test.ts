import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { refuseFleetSeats } from "./programs.ts";

describe("fleet enrollment", () => {
  it("refuses a one-driver seat and allows two", () => {
    assert.match(refuseFleetSeats(1) ?? "", /pool of one/);
    assert.match(refuseFleetSeats(0) ?? "", /at least two/);
    assert.equal(refuseFleetSeats(2), null);
    assert.equal(refuseFleetSeats(20), null);
  });
});
