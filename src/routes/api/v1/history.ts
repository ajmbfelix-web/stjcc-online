import { createFileRoute } from "@tanstack/react-router";
import { loadClientHistory } from "@/lib/accounts/file.server";
import { scopeClientHistory } from "@/lib/accounts/guards";
import { getSql } from "@/lib/db";
import { requirePortalAccess } from "@/lib/portal/access.server";

export const Route = createFileRoute("/api/v1/history")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const access = await requirePortalAccess(request);
          const requested = new URL(request.url).searchParams.get("onboardingId");
          const scope = scopeClientHistory(access, requested);
          if (!scope.ok) return Response.json({ error: scope.error }, { status: scope.status });
          const history = await loadClientHistory(await getSql(), scope.onboardingId);
          return Response.json(history);
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "History unavailable" }, { status: 401 });
        }
      },
    },
  },
});
