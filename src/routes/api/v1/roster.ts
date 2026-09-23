import { createFileRoute } from "@tanstack/react-router";
import { runAutomation, saveRosterDriver } from "@/lib/automation/engine";
import { applySeatChange, countBillableDrivers } from "@/lib/billing/seats.server";
import { getSql } from "@/lib/db";
import { requirePortalAccess } from "@/lib/portal/access.server";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function optionalDate(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !datePattern.test(value)) throw new Error("Dates must use YYYY-MM-DD");
  return value;
}

export const Route = createFileRoute("/api/v1/roster")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const access = await requirePortalAccess(request);
          if (access.kind !== "active_client" || !access.onboardingId) {
            return Response.json({ error: "An active organization workspace is required" }, { status: 403 });
          }
          const body = (await request.json()) as Record<string, unknown>;
          const name = typeof body.name === "string" ? body.name.trim() : "";
          const cdl = typeof body.cdl === "string" ? body.cdl.trim() : "";
          if (!name || !cdl) return Response.json({ error: "Driver name and CDL are required" }, { status: 400 });
          const needsTesting = body.needsTesting !== false;
          const sql = await getSql();
          const before = await countBillableDrivers(sql, access.onboardingId);
          const prior = await sql.query<{
            name: string;
            medical_card_expires_on: string | null;
            mvr_reviewed_on: string | null;
            clearinghouse_queried_on: string | null;
            hired_on: string | null;
            in_random_pool: boolean;
            needs_testing: boolean;
          }>(
            `select name, medical_card_expires_on, mvr_reviewed_on, clearinghouse_queried_on, hired_on, in_random_pool, needs_testing
             from driver_roster where account_id = $1 and cdl = $2`,
            [access.onboardingId, cdl.toUpperCase()],
          );
          const saved = await saveRosterDriver(sql, access.onboardingId, {
            name,
            cdl,
            medicalCardExpiresOn: optionalDate(body.medicalCardExpiresOn),
            mvrReviewedOn: optionalDate(body.mvrReviewedOn),
            clearinghouseQueriedOn: optionalDate(body.clearinghouseQueriedOn),
            hiredOn: optionalDate(body.hiredOn),
            inRandomPool: needsTesting,
            needsTesting,
            actorUserId: access.user.id,
          });
          try {
            const after = await countBillableDrivers(sql, access.onboardingId);
            const seat = await applySeatChange(sql, {
              accountId: access.onboardingId,
              before,
              after,
              driverName: name,
              cdl: cdl.toUpperCase(),
            });
            const automation = await runAutomation({ reason: "roster", force: true });
            return Response.json({ driver: saved, seat, automation }, { status: 201 });
          } catch (error) {
            const previous = prior[0];
            if (previous) {
              await saveRosterDriver(sql, access.onboardingId, {
                name: previous.name,
                cdl,
                medicalCardExpiresOn: previous.medical_card_expires_on,
                mvrReviewedOn: previous.mvr_reviewed_on,
                clearinghouseQueriedOn: previous.clearinghouse_queried_on,
                hiredOn: previous.hired_on,
                inRandomPool: previous.in_random_pool,
                needsTesting: previous.needs_testing,
              });
            } else {
              await sql.query(`delete from driver_roster where account_id = $1 and cdl = $2`, [access.onboardingId, cdl.toUpperCase()]);
            }
            throw error;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Roster update failed";
          const status = message === "Authentication required" ? 401 : message.includes("active organization") ? 403 : 400;
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});
