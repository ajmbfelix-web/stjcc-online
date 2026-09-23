import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { loadOwnerDesk } from "@/lib/portal/desk.server";
import { requireOwner } from "@/lib/portal/owner.server";

export const Route = createFileRoute("/api/owner/desk")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireOwner(request);
          return Response.json(await loadOwnerDesk(await getSql()));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Owner access required";
          const denied = message === "Owner authentication required" || message === "SJCC owner access required";
          return Response.json({ error: message }, { status: denied ? 403 : 500 });
        }
      },
    },
  },
});
