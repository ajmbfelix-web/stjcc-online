import { createFileRoute } from "@tanstack/react-router";
import { claimOrganization } from "@/lib/automation/engine";
import { getSql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/verify.server";

export const Route = createFileRoute("/api/onboarding/claim")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const tokenHeader = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        const user = await getSessionUser(tokenHeader);
        if (!user) return Response.json({ error: "Sign in before claiming an organization" }, { status: 401 });
        let body: { token?: string };
        try {
          body = (await request.json()) as { token?: string };
        } catch {
          return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
        }
        if (!body.token?.trim()) return Response.json({ error: "Claim code is required" }, { status: 400 });
        try {
          const claimed = await claimOrganization(await getSql(), { userId: user.id, token: body.token });
          if (!claimed) return Response.json({ error: "Claim code was not recognized" }, { status: 404 });
          return Response.json(claimed);
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Claim failed" }, { status: 409 });
        }
      },
    },
  },
});
