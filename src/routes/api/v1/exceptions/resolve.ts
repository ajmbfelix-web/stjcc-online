import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { requirePortalAccess } from "@/lib/portal/access.server";

export const Route = createFileRoute("/api/v1/exceptions/resolve")({
  server: { handlers: { POST: async ({ request }) => {
    try {
      const access = await requirePortalAccess(request);
      const body = (await request.json()) as { id?: string };
      if (!body.id) return Response.json({ error: "Exception id is required" }, { status: 400 });
      const sql = await getSql();
      const params = access.kind === "owner" ? [body.id] : [body.id, access.onboardingId];
      const where = access.kind === "owner" ? "id = $1" : "id = $1 and account_id = $2";
      const rows = await sql.query<{ id: string }>(`update compliance_exceptions set resolved = true, resolved_at = now() where ${where} and resolved = false returning id`, params);
      if (!rows[0]) return Response.json({ error: "Exception not found" }, { status: 404 });
      return Response.json({ resolved: true, id: rows[0].id });
    } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Unable to resolve exception" }, { status: 403 }); }
  } } },
});