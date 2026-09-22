import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ALCOHOL_ANNUAL_RATE,
  DRUG_ANNUAL_RATE,
  activationChecklist,
  annualTarget,
  billingDecision,
  canResolveException,
  classifyAccess,
  collectionFindings,
  decideLabUpdate,
  needsPreEmployment,
  onboardingFindings,
  ownerEscalations,
  periodKey,
  planRandomDraw,
  qualificationFindings,
  selectionsDue,
  trackingProfile,
} from "./policy.ts";

describe("portal access", () => {
  it("keeps owner, active, pending, and unassigned distinct", () => {
    assert.equal(classifyAccess({ isOwner: true, onboardingId: "onb_1", status: "active" }), "owner");
    assert.equal(classifyAccess({ isOwner: false, onboardingId: "onb_1", status: "active" }), "active_client");
    assert.equal(classifyAccess({ isOwner: false, onboardingId: "onb_1", status: "past_due" }), "active_client");
    assert.equal(classifyAccess({ isOwner: false, onboardingId: "onb_1", status: "payment_pending" }), "pending_client");
    assert.equal(classifyAccess({ isOwner: false, onboardingId: "onb_1", status: "suspended" }), "pending_client");
    assert.equal(classifyAccess({ isOwner: false }), "unassigned");
  });

  it("lets only the owning client close their own action", () => {
    assert.equal(canResolveException({ kind: "owner", audience: "owner", accountId: "a" }), true);
    assert.equal(canResolveException({ kind: "active_client", audience: "owner", accountId: "a", onboardingId: "a" }), false);
    assert.equal(canResolveException({ kind: "active_client", audience: "client", accountId: "b", onboardingId: "a" }), false);
    assert.equal(canResolveException({ kind: "pending_client", audience: "client", accountId: "a", onboardingId: "a" }), false);
    assert.equal(canResolveException({ kind: "active_client", audience: "client", accountId: "a", onboardingId: "a" }), true);
  });
});

describe("consortium random draw", () => {
  const pool = [
    { id: "d1", accountId: "a" },
    { id: "d2", accountId: "a" },
    { id: "d3", accountId: "b" },
    { id: "d4", accountId: "b" },
  ];

  it("paces the FMCSA annual rates across the shared pool", () => {
    assert.equal(annualTarget(4, DRUG_ANNUAL_RATE), 2);
    assert.equal(annualTarget(4, ALCOHOL_ANNUAL_RATE), 1);
    assert.equal(selectionsDue({ poolSize: 4, rate: DRUG_ANNUAL_RATE, alreadySelectedThisYear: 0, quarter: 1 }), 1);
    assert.equal(selectionsDue({ poolSize: 4, rate: DRUG_ANNUAL_RATE, alreadySelectedThisYear: 1, quarter: 2 }), 0);
    assert.equal(selectionsDue({ poolSize: 4, rate: DRUG_ANNUAL_RATE, alreadySelectedThisYear: 1, quarter: 3 }), 1);
    assert.equal(selectionsDue({ poolSize: 1, rate: ALCOHOL_ANNUAL_RATE, alreadySelectedThisYear: 0, quarter: 1 }), 1);
  });

  it("is stable and does not redraw drivers already selected this year", () => {
    const first = planRandomDraw({
      candidates: pool,
      alreadySelectedIds: [],
      rate: DRUG_ANNUAL_RATE,
      quarter: 1,
      seed: "2026:drug",
    });
    const second = planRandomDraw({
      candidates: pool,
      alreadySelectedIds: [],
      rate: DRUG_ANNUAL_RATE,
      quarter: 1,
      seed: "2026:drug",
    });
    assert.deepEqual(first, second);
    assert.equal(first.length, 1);
    const later = planRandomDraw({
      candidates: pool,
      alreadySelectedIds: first.map((item) => item.id),
      rate: DRUG_ANNUAL_RATE,
      quarter: 2,
      seed: "2026:drug",
    });
    assert.equal(later.length, 0);
  });
});

describe("workflow decisions", () => {
  it("activates on paid invoices and only escalates billing failures", () => {
    assert.equal(billingDecision("invoice.paid"), "activate");
    assert.equal(billingDecision("checkout.session.completed"), "activate");
    assert.equal(billingDecision("invoice.payment_failed"), "past_due");
    assert.equal(billingDecision("customer.subscription.deleted"), "suspend");
    assert.equal(billingDecision("customer.updated"), "ignore");
  });

  it("clears negative results without an owner exception and blocks silent reversals", () => {
    assert.equal(decideLabUpdate("COLLECTION_PENDING", "CLEARED").action, "apply");
    assert.equal(decideLabUpdate("CLEARED", "EXCEPTION").action, "conflict");
    assert.equal(decideLabUpdate("EXCEPTION", "CLEARED").action, "conflict");
    assert.equal(decideLabUpdate("MRO_HOLD", "CLEARED").action, "apply");
    assert.equal(decideLabUpdate("CLEARED", "CLEARED").action, "ignore");
  });

  it("orders pre-employment only for new drivers", () => {
    assert.equal(needsPreEmployment({ hiredOn: "2020-01-01", today: "2026-09-22", hasPreEmployment: false }), false);
    assert.equal(needsPreEmployment({ hiredOn: "2026-09-10", today: "2026-09-22", hasPreEmployment: false }), true);
    assert.equal(needsPreEmployment({ hiredOn: null, today: "2026-09-22", hasPreEmployment: false }), true);
    assert.equal(needsPreEmployment({ hiredOn: null, today: "2026-09-22", hasPreEmployment: true }), false);
  });

  it("tracks the services the organization actually bought", () => {
    assert.deepEqual(trackingProfile(["DOT drug and alcohol testing"]), {
      medical: true,
      mvr: true,
      clearinghouse: true,
      random: true,
    });
    assert.deepEqual(trackingProfile(["Background screening"]), {
      medical: false,
      mvr: false,
      clearinghouse: false,
      random: false,
    });
  });
});

describe("exception policy", () => {
  const profile = trackingProfile(["DOT drug and alcohol testing", "Driver qualification file"]);

  it("sends an expired medical card to the owner and a 30-day renewal to the client", () => {
    const expired = qualificationFindings({
      rosterId: "r1",
      name: "Ada",
      today: "2026-09-22",
      profile,
      medicalCardExpiresOn: "2026-09-01",
      mvrReviewedOn: "2026-08-01",
      clearinghouseQueriedOn: "2026-08-01",
      hiredOn: "2024-01-01",
    });
    assert.equal(expired.some((item) => item.audience === "owner" && item.dedupeKey.includes("medical_overdue")), true);
    const due = qualificationFindings({
      rosterId: "r1",
      name: "Ada",
      today: "2026-09-22",
      profile,
      medicalCardExpiresOn: "2026-10-01",
      mvrReviewedOn: "2026-08-01",
      clearinghouseQueriedOn: "2026-08-01",
      hiredOn: "2024-01-01",
    });
    assert.equal(due.some((item) => item.audience === "owner"), false);
    assert.equal(due.some((item) => item.audience === "client" && item.dedupeKey.includes("medical_due")), true);
  });

  it("escalates a client action only after it sits for 14 days", () => {
    const open = qualificationFindings({
      rosterId: "r1",
      name: "Ada",
      today: "2026-09-22",
      profile,
      medicalCardExpiresOn: "2026-10-01",
      mvrReviewedOn: "2026-08-01",
      clearinghouseQueriedOn: "2026-08-01",
    });
    const client = open.find((item) => item.audience === "client");
    assert.ok(client);
    assert.equal(ownerEscalations(open, { [client.dedupeKey]: "2026-09-20" }, "2026-09-22").length, 0);
    assert.equal(ownerEscalations(open, { [client.dedupeKey]: "2026-09-01" }, "2026-09-22").length, 1);
  });

  it("keeps a fresh collection with the client and escalates after 7 days", () => {
    const fresh = collectionFindings({
      orderId: "ord_1",
      driverName: "Ada",
      openedOn: "2026-09-21",
      today: "2026-09-22",
      testLabel: "Random drug test",
    });
    assert.equal(fresh.some((item) => item.audience === "owner"), false);
    const late = collectionFindings({
      orderId: "ord_1",
      driverName: "Ada",
      openedOn: "2026-09-01",
      today: "2026-09-22",
      testLabel: "Random drug test",
    });
    assert.equal(late.some((item) => item.audience === "owner"), true);
  });

  it("blocks activation on a missing billing integration and stalls only after a week", () => {
    const blocked = onboardingFindings({
      id: "onb_1",
      organizationName: "North Haul",
      status: "payment_pending",
      createdOn: "2026-09-22",
      today: "2026-09-22",
      billingConfigured: false,
    });
    assert.equal(blocked.some((item) => item.dedupeKey.startsWith("owner:billing_unconfigured")), true);
    assert.equal(blocked.some((item) => item.dedupeKey.startsWith("owner:onboarding_stalled")), false);
    const stalled = onboardingFindings({
      id: "onb_1",
      organizationName: "North Haul",
      status: "payment_pending",
      createdOn: "2026-09-01",
      today: "2026-09-22",
      billingConfigured: true,
    });
    assert.equal(stalled.some((item) => item.source === "onboarding" && item.audience === "owner"), true);
    assert.equal(activationChecklist({ status: "payment_pending", billingStatus: "not_started", billingConfigured: false })[2]?.state, "blocked");
  });
});

describe("period", () => {
  it("uses UTC quarters", () => {
    assert.equal(periodKey(new Date("2026-09-22T15:00:00Z")), "2026-Q3");
    assert.equal(periodKey(new Date("2026-01-01T00:30:00Z")), "2026-Q1");
  });
});
