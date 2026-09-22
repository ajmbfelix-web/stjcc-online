import { createFileRoute } from "@tanstack/react-router";
import { runAutomation, saveRosterDriver } from "@/lib/automation/engine";
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
          const saved = await saveRosterDriver(await getSql(), access.onboardingId, {
            name,
            cdl,
            medicalCardExpiresOn: optionalDate(body.medicalCardExpiresOn),
            mvrReviewedOn: optionalDate(body.mvrReviewedOn),
            clearinghouseQueriedOn: optionalDate(body.clearinghouseQueriedOn),
            hiredOn: optionalDate(body.hiredOn),
            inRandomPool: body.inRandomPool !== false,
          });
          const automation = await runAutomation({ reason: "roster", force: true });
          return Response.json({ driver: saved, automation }, { status: 201 });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Roster update failed";
          const status = message === "Authentication required" ? 401 : message.includes("active organization") ? 403 : 400;
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});
