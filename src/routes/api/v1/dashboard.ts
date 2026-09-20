import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "@/lib/auth/verify.server";
import { listDrivers, listEvents } from "@/lib/compliance/store";

export const Route = createFileRoute("/api/v1/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        const user = await getSessionUser(bearerToken);
        if (!user) {
          return Response.json({ error: "Owner authentication required" }, { status: 401 });
        }

        const accountId = process.env.COMPLIANCE_ACCOUNT_ID ?? "SJCC-DEMO";
        const [drivers, events] = await Promise.all([listDrivers(accountId), listEvents(accountId)]);
        return Response.json({ drivers, events });
      },
    },
  },
});
