import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { acknowledgeException, addAccountNote, loadClientHistory } from "./file.server.ts";
import { scopeAcknowledge, scopeClientHistory, scopeOwnerNote } from "./guards.ts";

async function testDb() {
  const db = new PGlite();
  const root = await readdir("migrations");
  const auth = await readdir("migrations/auth");
  const files = [
    ...auth.map((name) => `migrations/auth/${name}`),
    ...root.filter((name) => name.endsWith(".sql")).map((name) => `migrations/${name}`),
  ].sort((left, right) => left.split("/").pop()!.localeCompare(right.split("/").pop()!));
  for (const file of files) await db.exec(await readFile(file, "utf8"));
  return {
    query: async <T>(text: string, params: unknown[] = []) => (await db.query<T>(text, params)).rows,
  };
}

describe("account isolation", () => {
  it("rejects another organization's history", () => {
    const own = scopeClientHistory({ kind: "active_client", onboardingId: "onb_a" }, "onb_a");
    const foreign = scopeClientHistory({ kind: "active_client", onboardingId: "onb_a" }, "onb_b");
    const owner = scopeClientHistory({ kind: "owner" }, "onb_a");
    assert.equal(own.ok, true);
    assert.equal(foreign.ok, false);
    if (!foreign.ok) assert.equal(foreign.status, 403);
    assert.equal(owner.ok, false);
  });

  it("keeps notes owner-only and rejects an empty acknowledgment", () => {
    assert.equal(scopeOwnerNote("active_client", "hello").ok, false);
    assert.equal(scopeOwnerNote("owner", "  ").ok, false);
    assert.equal(scopeOwnerNote("owner", "Called the client.").ok, true);
    const empty = scopeAcknowledge("owner", "");
    assert.equal(empty.ok, false);
    if (!empty.ok) assert.equal(empty.status, 400);
    assert.equal(scopeAcknowledge("active_client", "note").ok, false);
  });

  it("does not return another company's orders or owner notes to a client history query", async () => {
    const sql = await testDb();
    await sql.query(
      `insert into client_onboarding (id, organization_name, dot_number, contact_name, contact_email, services, status)
       values
        ('onb_a', 'North', '1', 'A', 'a@north.test', '[]'::jsonb, 'active'),
        ('onb_b', 'South', '2', 'B', 'b@south.test', '[]'::jsonb, 'active')`,
    );
    await sql.query(
      `insert into service_orders
        (id, onboarding_id, channel, company_name, result_email, candidate_name, sku, reason, amount_cents, estimated_cost_cents, status)
       values
        ('svc_a', 'onb_a', 'client', 'North', 'a@north.test', 'Ada', 'dot_drug', 'random_drug', 6500, 4800, 'paid'),
        ('svc_b', 'onb_b', 'client', 'South', 'b@south.test', 'Bea', 'dot_drug', 'random_drug', 6500, 4800, 'paid')`,
    );
    await addAccountNote(sql, { onboardingId: "onb_a", actorUserId: "owner_1", body: "Owner only note" });
    const history = await loadClientHistory(sql, "onb_a");
    assert.equal(history.orders.length, 1);
    assert.equal((history.orders[0] as { id: string }).id, "svc_a");
    assert.equal(JSON.stringify(history).includes("Owner only note"), false);
    assert.equal(JSON.stringify(history).includes("estimatedCost"), false);
    await assert.rejects(() => acknowledgeException(sql, { id: "missing", note: "   ", actorUserId: "owner_1", kind: "owner" }));
  });
});
