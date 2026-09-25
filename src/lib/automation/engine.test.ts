import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { applyBillingEvent, runAutomationWith, syncLabStatus } from "./engine.ts";

delete process.env.STRIPE_SECRET_KEY;
delete process.env.STRIPE_PRICE_ID;
delete process.env.RESEND_API_KEY;
delete process.env.RESEND_FROM_EMAIL;

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

describe("automation engine", () => {
  it("draws the combined consortium, keeps each selection on the driver's company, and activates billing without an owner", async () => {
    const sql = await testDb();
    await sql.query(
      `insert into client_onboarding
        (id, organization_name, dot_number, contact_name, contact_email, driver_count, services, status)
       values
        ('onb_a', 'North Haul', '1000001', 'Ada', 'ada@north.test', 2, $1::jsonb, 'active'),
        ('onb_b', 'South Haul', '1000002', 'Bea', 'bea@south.test', 2, $1::jsonb, 'active'),
        ('onb_pending', 'West Haul', '1000003', 'Cam', 'cam@west.test', 1, $1::jsonb, 'payment_pending')`,
      [JSON.stringify(["DOT drug and alcohol testing"])],
    );

    for (const driver of [
      ["onb_a", "Ada Miles", "CDL-A1"],
      ["onb_a", "Ada North", "CDL-A2"],
      ["onb_b", "Bea Miles", "CDL-B1"],
      ["onb_b", "Bea South", "CDL-B2"],
    ] as const) {
      await sql.query(
        `insert into driver_roster
          (id, account_id, name, cdl, medical_card_expires_on, mvr_reviewed_on, clearinghouse_queried_on, hired_on)
         values ($1, $2, $3, $4, '2027-01-01', '2025-12-01', '2025-12-01', '2020-01-01')`,
        [`drv_${driver[2]}`, driver[0], driver[1], driver[2]],
      );
    }

    await sql.query(
      `insert into compliance_drivers (id, account_id, name, cdl, test_type, status, barcode, roster_id, order_reason, created_at)
       values ('ord_lab', 'onb_a', 'Ada Miles', 'CDL-A1', '5_PANEL', 'COLLECTION_PENDING', 'BAR1', 'drv_CDL-A1', 'pre_employment', '2026-01-10')`,
    );

    const first = await runAutomationWith(sql, { reason: "test", now: new Date("2026-01-15T15:00:00Z") });
    assert.equal(first.drugDraws, 1);
    assert.equal(first.alcoholDraws, 1);
    assert.equal(first.preEmploymentOrders, 0);
    assert.equal(first.skipped, false);
    const crossed = await sql.query<{ count: number }>(
      `select count(*)::int as count
       from random_selections s
       join driver_roster r on r.id = s.roster_id
       where s.account_id <> r.account_id`,
    );
    assert.equal(Number(crossed[0]?.count), 0);
    const companyA = await sql.query<{ count: number }>(
      `select count(*)::int as count from random_selections where account_id = 'onb_a'`,
    );
    const companyB = await sql.query<{ count: number }>(
      `select count(*)::int as count from random_selections where account_id = 'onb_b'`,
    );
    assert.equal(Number(companyA[0]?.count) + Number(companyB[0]?.count), 2);

    const second = await runAutomationWith(sql, { reason: "test", now: new Date("2026-01-15T16:00:00Z") });
    assert.equal(second.drugDraws, 0);
    assert.equal(second.alcoholDraws, 0);

    const blocked = await sql.query<{ count: number }>(
      `select count(*)::int as count from compliance_exceptions where dedupe_key = 'owner:billing_unconfigured:onb_pending' and resolved = false`,
    );
    assert.equal(Number(blocked[0]?.count), 1);
    const email = await sql.query<{ count: number }>(
      `select count(*)::int as count from compliance_exceptions where dedupe_key = 'owner:email_unconfigured' and resolved = false`,
    );
    assert.equal(Number(email[0]?.count), 1);

    await sql.query(`update driver_roster set medical_card_expires_on = '2025-01-01' where id = 'drv_CDL-A1'`);
    await runAutomationWith(sql, { reason: "test", now: new Date("2026-09-22T15:00:00Z") });
    const expired = await sql.query<{ count: number }>(
      `select count(*)::int as count from compliance_exceptions where dedupe_key like 'owner:medical_overdue:%' and resolved = false`,
    );
    assert.equal(Number(expired[0]?.count), 0);

    await sql.query(`update driver_roster set medical_card_expires_on = '2027-06-01' where id = 'drv_CDL-A1'`);
    await runAutomationWith(sql, { reason: "test", now: new Date("2026-09-22T16:00:00Z") });
    const clearedMedical = await sql.query<{ count: number }>(
      `select count(*)::int as count from compliance_exceptions where dedupe_key like 'owner:medical_overdue:%' and resolved = false`,
    );
    assert.equal(Number(clearedMedical[0]?.count), 0);

    const cleared = await syncLabStatus(sql, {
      accountId: "onb_a",
      driverId: "ord_lab",
      driverName: "Ada Miles",
      current: "COLLECTION_PENDING",
      incoming: "CLEARED",
    });
    assert.equal(cleared.conflict, false);
    assert.equal(cleared.status, "CLEARED");
    const labExceptions = await sql.query<{ count: number }>(
      `select count(*)::int as count from compliance_exceptions where dedupe_key like 'owner:lab:ord_lab:%' and resolved = false`,
    );
    assert.equal(Number(labExceptions[0]?.count), 0);

    const conflict = await syncLabStatus(sql, {
      accountId: "onb_a",
      driverId: "ord_lab",
      driverName: "Ada Miles",
      current: "CLEARED",
      incoming: "EXCEPTION",
    });
    assert.equal(conflict.conflict, true);
    const status = await sql.query<{ status: string }>(`select status from compliance_drivers where id = 'ord_lab'`);
    assert.equal(status[0]?.status, "CLEARED");

    await sql.query(`insert into "user" (id, name, email, "emailVerified") values ('user_cam', 'Cam', 'cam@west.test', false)`);
    const decision = await applyBillingEvent(sql, { eventType: "invoice.paid", onboardingId: "onb_pending", customerId: "cus_pending" });
    assert.equal(decision, "activate");
    const org = await sql.query<{ status: string; stripe_customer_id: string }>(
      `select status, stripe_customer_id from client_onboarding where id = 'onb_pending'`,
    );
    assert.equal(org[0]?.status, "active");
    assert.equal(org[0]?.stripe_customer_id, "cus_pending");
    const link = await sql.query<{ user_id: string }>(`select user_id from client_user_access where onboarding_id = 'onb_pending'`);
    assert.equal(link[0]?.user_id, "user_cam");
  });

  it("does not draw a one-driver company and opens the small-fleet exception", async () => {
    const sql = await testDb();
    await sql.query(
      `insert into client_onboarding
        (id, organization_name, dot_number, contact_name, contact_email, driver_count, services, status)
       values ('onb_solo', 'Solo Haul', '1000009', 'Sam', 'sam@solo.test', 1, $1::jsonb, 'active')`,
      [JSON.stringify(["dot_testing"])],
    );
    await sql.query(
      `insert into driver_roster (id, account_id, name, cdl, hired_on, in_random_pool, needs_testing)
       values ('drv_solo', 'onb_solo', 'Sam Solo', 'CDL-S1', '2020-01-01', true, true)`,
    );
    const summary = await runAutomationWith(sql, { reason: "test", now: new Date("2026-03-15T15:00:00Z") });
    assert.equal(summary.drugDraws, 0);
    assert.equal(summary.alcoholDraws, 0);
    const selected = await sql.query<{ count: number }>(`select count(*)::int as count from random_selections where account_id = 'onb_solo'`);
    assert.equal(Number(selected[0]?.count), 0);
    const exception = await sql.query<{ count: number }>(
      `select count(*)::int as count from compliance_exceptions where dedupe_key = 'owner:small_fleet:onb_solo' and resolved = false`,
    );
    assert.equal(Number(exception[0]?.count), 1);
  });

  it("selects the consortium year-end total across both companies, and never stores a driver on the wrong account", async () => {
    const sql = await testDb();
    await sql.query(
      `insert into client_onboarding
        (id, organization_name, dot_number, contact_name, contact_email, driver_count, services, status)
       values
        ('onb_ten', 'Ten Haul', '1000010', 'Ten', 'ten@haul.test', 10, $1::jsonb, 'active'),
        ('onb_other', 'Other Haul', '1000011', 'Other', 'other@haul.test', 3, $1::jsonb, 'active')`,
      [JSON.stringify(["DOT drug and alcohol testing"])],
    );
    for (let index = 0; index < 10; index += 1) {
      await sql.query(
        `insert into driver_roster (id, account_id, name, cdl, hired_on) values ($1, 'onb_ten', $2, $3, '2019-01-01')`,
        [`drv_ten_${index}`, `Driver ${index}`, `CDL-T${index}`],
      );
    }
    for (const cdl of ["CDL-O1", "CDL-O2", "CDL-O3"]) {
      await sql.query(
        `insert into driver_roster (id, account_id, name, cdl, hired_on) values ($1, 'onb_other', $2, $3, '2019-01-01')`,
        [`drv_${cdl}`, cdl, cdl],
      );
    }
    await runAutomationWith(sql, { reason: "test", now: new Date("2026-12-15T15:00:00Z") });
    const totals = await sql.query<{ testKind: string; count: number }>(
      `select test_kind as "testKind", count(*)::int as count from random_selections group by test_kind`,
    );
    const drug = totals.find((row) => row.testKind === "drug")?.count ?? 0;
    const alcohol = totals.find((row) => row.testKind === "alcohol")?.count ?? 0;
    assert.equal(Number(drug), 7);
    assert.equal(Number(alcohol), 2);
    const leak = await sql.query<{ count: number }>(
      `select count(*)::int as count
       from random_selections s
       join driver_roster r on r.id = s.roster_id
       where s.account_id = 'onb_ten' and r.account_id <> 'onb_ten'`,
    );
    assert.equal(Number(leak[0]?.count), 0);
  });
});
