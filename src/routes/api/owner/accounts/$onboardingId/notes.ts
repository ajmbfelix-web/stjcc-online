import { createFileRoute } from "@tanstack/react-router";
import { addAccountNote } from "@/lib/accounts/file.server";
import { scopeOwnerNote } from "@/lib/accounts/guards";
import { getSql } from "@/lib/db";
import { requireOwner } from "@/lib/portal/owner.server";

export const Route = createFileRoute("/api/owner/accounts/$onboardingId/notes")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        try {
          const owner = await requireOwner(request);
          const body = (await request.json()) as { body?: string; rosterId?: string };
          const decision = scopeOwnerNote("owner", typeof body.body === "string" ? body.body : "");
          if (!decision.ok) return Response.json({ error: decision.error }, { status: decision.status });
          const note = await addAccountNote(await getSql(), {
            onboardingId: params.onboardingId,
            rosterId: typeof body.rosterId === "string" ? body.rosterId : null,
            actorUserId: owner.id,
            body: decision.body,
          });
          return Response.json(note, { status: 201 });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Note was not saved";
          const status = message === "A note is required" ? 400 : 403;
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});
