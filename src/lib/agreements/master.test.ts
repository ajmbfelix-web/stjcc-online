import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { agreementBlocker, masterAgreementBody } from "./master.ts";

const signed = {
  termsAccepted: true,
  esignConsent: true,
  billingAuthorized: true,
  complianceAcknowledged: true,
  authorityConfirmed: true,
  signatureName: "Mary Client",
  signerTitle: "Owner",
};

describe("master agreement", () => {
  it("keeps the monthly seat price and the charge authorization in the contract", () => {
    const body = masterAgreementBody();
    assert.match(body, /\$5\.00\) per driver who needs testing/);
    assert.match(body, /payment method on file/);
    assert.match(body, /Michigan/);
  });

  it("rejects a signature that skipped an acknowledgment", () => {
    assert.equal(agreementBlocker({ ...signed, billingAuthorized: false }), "Every acknowledgment under the agreement is required");
    assert.equal(agreementBlocker({ ...signed, signatureName: " " }), "Type your full name as the electronic signature");
    assert.equal(agreementBlocker(signed), null);
  });
});
