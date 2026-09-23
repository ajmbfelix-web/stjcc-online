import { createFileRoute } from "@tanstack/react-router";
import { loadAccountFile } from "@/lib/accounts/file.server";
import { getSql } from "@/lib/db";
import { requireOwner } from "@/lib/portal/owner.server";

export const Route = createFileRoute("/api/owner/accounts/$onboardingId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          await requireOwner(request);
          const file = await loadAccountFile(await getSql(), params.onboardingId);
          if (!file) return Response.json({ error: "Organization not found" }, { status: 404 });
          return Response.json(file);
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Account unavailable" }, { status: 403 });
        }
      },
    },
  },
});
