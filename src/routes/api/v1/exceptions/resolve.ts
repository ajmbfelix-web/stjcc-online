import { createFileRoute } from "@tanstack/react-router";
import { canResolveException } from "@/lib/automation/policy";
import { getSql } from "@/lib/db";
import { requirePortalAccess } from "@/lib/portal/access.server";

export const Route = createFileRoute("/api/v1/exceptions/resolve")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const access = await requirePortalAccess(request);
          const body = (await request.json()) as { id?: string };
          if (!body.id) return Response.json({ error: "Exception id is required" }, { status: 400 });
          const sql = await getSql();
          const rows = await sql.query<{ id: string; account_id: string; audience: string }>(
            `select id, account_id, audience from compliance_exceptions where id = $1 and resolved = false`,
            [body.id],
          );
          const exception = rows[0];
          if (!exception) return Response.json({ error: "Exception not found" }, { status: 404 });
          if (
            !canResolveException({
              kind: access.kind,
              audience: exception.audience,
              accountId: exception.account_id,
              onboardingId: access.onboardingId,
            })
          ) {
            return Response.json({ error: "You cannot resolve this exception" }, { status: 403 });
          }
          await sql.query(`update compliance_exceptions set resolved = true, resolved_at = now() where id = $1`, [exception.id]);
          return Response.json({ resolved: true, id: exception.id });
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Unable to resolve exception" }, { status: 403 });
        }
      },
    },
  },
});
