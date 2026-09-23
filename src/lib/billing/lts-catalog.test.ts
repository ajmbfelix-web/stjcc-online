import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CATALOG } from "./catalog.ts";
import { LTS_ALLOWLIST, LTS_REFUSED, ltsItem } from "./lts-catalog.ts";

describe("LTS catalog", () => {
  it("contains only allowlisted SKUs", () => {
    const offered = Object.keys(CATALOG).sort();
    const allowed = LTS_ALLOWLIST.map((item) => item.sku).sort();
    assert.deepEqual(offered, allowed);
    for (const sku of offered) {
      assert.ok(ltsItem(sku));
      assert.equal(LTS_REFUSED.includes(sku as (typeof LTS_REFUSED)[number]), false);
      assert.ok(CATALOG[sku as keyof typeof CATALOG].ltsProductCode.startsWith("LTS-"));
    }
    assert.equal("dot_combo" in CATALOG, false);
    assert.equal(ltsItem("clearinghouse_query"), null);
    assert.equal(ltsItem("medical_card"), null);
    assert.equal(ltsItem("dq_file"), null);
    assert.equal(ltsItem("consortium"), null);
    assert.equal(ltsItem("ecup"), null);
  });
});
