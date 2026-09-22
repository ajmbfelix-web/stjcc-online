import { createFileRoute } from "@tanstack/react-router";
import { requireOwner } from "@/lib/portal/owner.server";
import { listOnboarding } from "@/lib/portal/store";

export const Route = createFileRoute("/api/owner/onboarding")({
  server: { handlers: { GET: async ({ request }) => {
    try { await requireOwner(request); return Response.json({ records: await listOnboarding() }); }
    catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Owner access required" }, { status: 403 }); }
  } } },
});