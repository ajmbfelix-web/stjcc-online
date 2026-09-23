import { createFileRoute } from "@tanstack/react-router";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getSql } from "@/lib/db";
import { requireOwner } from "@/lib/portal/owner.server";

export const Route = createFileRoute("/api/owner/reports/audit")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireOwner(request);
          const id = new URL(request.url).searchParams.get("onboardingId") ?? "";
          const sql = await getSql();
          const orgs = await sql.query<Record<string, unknown>>(
            `select organization_name, dot_number, contact_name, contact_email, status, billing_status, billed_driver_count
             from client_onboarding where id = $1`,
            [id],
          );
          const org = orgs[0];
          if (!org) return Response.json({ error: "Client not found" }, { status: 404 });
          const drivers = await sql.query<Record<string, unknown>>(
            `select name, cdl, medical_card_expires_on, mvr_reviewed_on, clearinghouse_queried_on, needs_testing
             from driver_roster where account_id = $1 order by name`,
            [id],
          );
          const orders = await sql.query<Record<string, unknown>>(
            `select candidate_name, sku, status, amount_cents, clearinghouse, created_at from service_orders where onboarding_id = $1 order by created_at desc`,
            [id],
          );
          const pdf = await PDFDocument.create();
          const font = await pdf.embedFont(StandardFonts.Helvetica);
          const page = pdf.addPage([612, 792]);
          const lines = [
            "SJCC audit packet",
            `${org.organization_name} · DOT ${org.dot_number}`,
            `${org.contact_name} · ${org.contact_email}`,
            `Status ${org.status} · billing ${org.billing_status} · seats ${org.billed_driver_count}`,
            "",
            "Drivers",
            ...drivers.map((driver) => `${driver.name} ${driver.cdl} medical ${driver.medical_card_expires_on ?? "—"} MVR ${driver.mvr_reviewed_on ?? "—"} CH ${driver.clearinghouse_queried_on ?? "—"}`),
            "",
            "Tests",
            ...orders.map((order) => `${order.created_at} ${order.candidate_name} ${order.sku} ${order.status} $${Number(order.amount_cents) / 100} clearinghouse ${order.clearinghouse}`),
            "",
            "This packet is a record. It does not report anything to the Clearinghouse.",
          ];
          let y = 750;
          for (const line of lines.slice(0, 40)) {
            page.drawText(String(line).slice(0, 90), { x: 48, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
            y -= 16;
          }
          const bytes = await pdf.save();
          return new Response(Buffer.from(bytes), {
            headers: {
              "content-type": "application/pdf",
              "content-disposition": `attachment; filename="sjcc-audit-${id}.pdf"`,
            },
          });
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Owner access required" }, { status: 403 });
        }
      },
    },
  },
});
