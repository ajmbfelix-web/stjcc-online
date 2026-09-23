import { createFileRoute } from "@tanstack/react-router";
import { loadDriverFile } from "@/lib/accounts/file.server";
import { getSql } from "@/lib/db";
import { requireOwner } from "@/lib/portal/owner.server";

export const Route = createFileRoute("/api/owner/accounts/$onboardingId/drivers/$rosterId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          await requireOwner(request);
          const file = await loadDriverFile(await getSql(), params.onboardingId, params.rosterId);
          if (!file) return Response.json({ error: "Driver not found" }, { status: 404 });
          return Response.json(file);
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Driver unavailable" }, { status: 403 });
        }
      },
    },
  },
});
