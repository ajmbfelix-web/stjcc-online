import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { exceptionForStatus, statusForVendorEvent, transitionEvent } from "./state-machine.ts";

describe("testing event state machine", () => {
  it("allows a collected event to enter result processing", () => {
    assert.equal(
      transitionEvent({ from: "collected", to: "result_pending" }),
      "result_pending",
    );
  });

  it("rejects clearing without a result", () => {
    assert.throws(
      () => transitionEvent({ from: "result_pending", to: "cleared" }),
      /requires a result/,
    );
  });

  it("maps vendor results and creates actionable exception metadata", () => {
    assert.equal(statusForVendorEvent("result.negative", "Negative"), "cleared");
    assert.deepEqual(exceptionForStatus("mro_hold"), {
      title: "Medical review officer hold",
      description: "The result requires medical review before the driver can be cleared.",
    });
  });
});