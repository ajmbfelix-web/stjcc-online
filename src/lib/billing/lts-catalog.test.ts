import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CATALOG, FLEET_ANNUAL_CENTS, requireLiveItem } from "./catalog.ts";
import { LTS_ALLOWLIST, ltsItem } from "./lts-catalog.ts";

describe("SJCC catalog", () => {
  it("sells the live shelf and refuses coming-soon charges", () => {
    assert.equal(FLEET_ANNUAL_CENTS, 29900);
    assert.equal(CATALOG.dot_drug.cents, 7300);
    assert.equal(CATALOG.dot_alcohol.cents, 6300);
    assert.equal(CATALOG.dot_combo.cents, 12900);
    assert.equal(CATALOG.dot_combo.live, true);
    assert.equal(CATALOG.dot_observed.cents, 10900);
    assert.equal(CATALOG.nondot_urine_5.live, true);
    assert.equal(CATALOG.nondot_urine_5.cents, 6900);
    assert.equal(CATALOG.hair.live, true);
    assert.equal(CATALOG.oral_fluid.live, false);
    assert.throws(() => requireLiveItem("oral_fluid"), /coming soon/);
    assert.equal(CATALOG.ch_setup.live, false);
    assert.equal(CATALOG.bg_basic.live, false);
    assert.equal(CATALOG.physical.live, false);
    assert.equal(CATALOG.boc3.live, false);
    assert.throws(() => requireLiveItem("bg_basic"), /coming soon/);
    assert.throws(() => requireLiveItem("consortium"), /Unknown service/);
    const lab = LTS_ALLOWLIST.map((item) => item.sku).sort();
    assert.deepEqual(lab, ["dot_alcohol", "dot_drug", "dot_observed", "hair", "mvr", "nondot_urine_10", "nondot_urine_5", "nondot_urine_9"]);
    for (const sku of lab) assert.ok(ltsItem(sku)?.ltsProductCode.startsWith("LTS-"));
    assert.equal(ltsItem("dot_combo"), null);
    assert.equal(ltsItem("clearinghouse_query"), null);
    assert.equal(ltsItem("consortium"), null);
    assert.equal(/\$7/.test(JSON.stringify(CATALOG)), false);
  });
});
