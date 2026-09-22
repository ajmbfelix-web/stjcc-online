import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";
import { runAutomation } from "@/lib/automation/engine";
import { getPortalAccess } from "@/lib/portal/access.server";

function secretMatches(provided: string | null, expected: string | undefined): boolean {
  const value = expected?.trim();
  if (!value || !provided) return false;
  const left = Buffer.from(provided);
  const right = Buffer.from(value);
  return left.length === right.length && timingSafeEqual(left, right);
}

async function handle(request: Request): Promise<Response> {
  const access = await getPortalAccess(request);
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  const allowed =
    access?.kind === "owner" ||
    secretMatches(request.headers.get("x-sjcc-automation-key"), process.env.AUTOMATION_SECRET) ||
    secretMatches(bearer, process.env.CRON_SECRET) ||
    secretMatches(bearer, process.env.AUTOMATION_SECRET);
  if (!allowed) return Response.json({ error: "Owner authentication required" }, { status: 403 });
  try {
    const summary = await runAutomation({ reason: access?.kind === "owner" ? "owner" : "schedule", force: true });
    return Response.json(summary);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Automation failed" }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/v1/automation/run")({
  server: {
    handlers: {
      POST: ({ request }) => handle(request),
      GET: ({ request }) => handle(request),
    },
  },
});