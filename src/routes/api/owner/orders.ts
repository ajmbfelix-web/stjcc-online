import { createFileRoute } from "@tanstack/react-router";
import { catalogItem } from "@/lib/billing/catalog";
import { getSql } from "@/lib/db";
import { checkoutServiceOrder } from "@/lib/orders/charge.server";
import { recordClearinghouseDecision, recordServiceResult } from "@/lib/orders/book";
import { sendOperationalEmail, resendConfigured } from "@/lib/notifications/resend.server";
import { requireOwner } from "@/lib/portal/owner.server";

export const Route = createFileRoute("/api/owner/orders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          await requireOwner(request);
          const body = (await request.json()) as Record<string, unknown>;
          const action = typeof body.action === "string" ? body.action : "create";
          if (action === "result") {
            const id = typeof body.id === "string" ? body.id : "";
            const outcome = body.outcome === "exception" ? "exception" : body.outcome === "refusal" ? "refusal" : "cleared";
            const summary = typeof body.summary === "string" ? body.summary : outcome;
            const recorded = await recordServiceResult(await getSql(), { id, outcome, summary });
            if (!recorded) return Response.json({ error: "That order is not paid yet" }, { status: 400 });
            if (resendConfigured()) {
              await sendOperationalEmail(
                recorded.resultEmail,
                `Test result for ${recorded.candidateName}`,
                `${recorded.companyName}\nCandidate: ${recorded.candidateName}\nResult: ${outcome}\n${summary}\n\nA non-negative DOT result is not reported to the Clearinghouse until the SJCC owner records that decision.`,
              );
            }
            return Response.json({ ok: true, clearinghouse: recorded.clearinghouse });
          }
          if (action === "clearinghouse") {
            const id = typeof body.id === "string" ? body.id : "";
            const decision = body.decision === "withheld" ? "withheld" : "recorded";
            const ok = await recordClearinghouseDecision(await getSql(), { id, decision });
            if (!ok) return Response.json({ error: "This result is not waiting for an owner decision" }, { status: 400 });
            return Response.json({ ok: true, decision });
          }
          const sku = typeof body.sku === "string" ? body.sku : "dot_drug";
          if (!catalogItem(sku)) return Response.json({ error: "Unknown test" }, { status: 400 });
          const companyName = typeof body.companyName === "string" ? body.companyName.trim() : "";
          const resultEmail = typeof body.resultEmail === "string" ? body.resultEmail.trim() : "";
          const candidateName = typeof body.candidateName === "string" ? body.candidateName.trim() : "";
          if (!companyName || !resultEmail || !candidateName) return Response.json({ error: "Company, result email, and candidate are required" }, { status: 400 });
          const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
          const created = await checkoutServiceOrder({
            channel: body.channel === "staffing" ? "staffing" : "walk_in",
            companyName,
            resultEmail,
            candidateName,
            candidateEmail: typeof body.candidateEmail === "string" ? body.candidateEmail : resultEmail,
            sku: sku as "dot_drug",
            reason: body.channel === "staffing" ? "staffing" : "one_off",
            origin,
          });
          return Response.json(created, { status: 201 });
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Order failed" }, { status: 400 });
        }
      },
    },
  },
});
