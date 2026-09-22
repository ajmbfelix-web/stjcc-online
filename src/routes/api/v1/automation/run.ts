import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";
import { runAutomation } from "@/lib/automation/engine";
import { getPortalAccess } from "@/lib/portal/access.server";

function secretMatches(provided: string | null): boolean {
  const expected = process.env.AUTOMATION_SECRET?.trim();
  if (!expected || !provided) return false;
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export const Route = createFileRoute("/api/v1/automation/run")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const access = await getPortalAccess(request);
        const allowed = access?.kind === "owner" || secretMatches(request.headers.get("x-sjcc-automation-key"));
        if (!allowed) return Response.json({ error: "Owner authentication required" }, { status: 403 });
        try {
          const summary = await runAutomation({ reason: access?.kind === "owner" ? "owner" : "schedule", force: true });
          return Response.json(summary);
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Automation failed" }, { status: 500 });
        }
      },
    },
  },
});
