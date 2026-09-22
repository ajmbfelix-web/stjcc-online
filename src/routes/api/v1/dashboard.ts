import { createFileRoute } from "@tanstack/react-router";
import { listDrivers, listEvents } from "@/lib/compliance/store";
import { requirePortalAccess } from "@/lib/portal/access.server";

export const Route = createFileRoute("/api/v1/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const access = await requirePortalAccess(request);
          const requested = new URL(request.url).searchParams.get("accountId");
          const accountId = access.kind === "owner" ? requested : access.onboardingId;
          if (!accountId || access.kind === "pending_client" || access.kind === "unassigned") {
            return Response.json({ error: "An active organization workspace is required" }, { status: 403 });
          }
          const [drivers, events] = await Promise.all([listDrivers(accountId), listEvents(accountId)]);
          return Response.json({ accountId, drivers, events });
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Authentication required" }, { status: 401 });
        }
      },
    },
  },
});
