import { createFileRoute } from "@tanstack/react-router";
import { catalogItem } from "@/lib/billing/catalog";
import { checkoutServiceOrder } from "@/lib/orders/charge.server";

export const Route = createFileRoute("/api/screen")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        const companyName = typeof body.companyName === "string" ? body.companyName.trim() : "";
        const resultEmail = typeof body.resultEmail === "string" ? body.resultEmail.trim() : "";
        const candidateName = typeof body.candidateName === "string" ? body.candidateName.trim() : "";
        const candidateEmail = typeof body.candidateEmail === "string" ? body.candidateEmail.trim() : "";
        const sku = typeof body.sku === "string" ? body.sku : "dot_drug";
        if (!catalogItem(sku)) return Response.json({ error: "Unknown test" }, { status: 400 });
        if (!companyName || !resultEmail || !candidateName || !candidateEmail) {
          return Response.json({ error: "Your name, email, staffing company, and their results email are required" }, { status: 400 });
        }
        try {
          const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
          const created = await checkoutServiceOrder({
            channel: "staffing",
            companyName,
            resultEmail,
            candidateName,
            candidateEmail,
            sku: sku as "dot_drug",
            reason: "staffing",
            origin,
          });
          return Response.json(created, { status: 201 });
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Could not start payment" }, { status: 400 });
        }
      },
    },
  },
});
