import { createFileRoute } from "@tanstack/react-router";
import { handleStripeWebhook } from "@/lib/billing/webhook.server";

export const Route = createFileRoute("/api/v1/webhooks/stripe")({
  server: {
    handlers: {
      POST: ({ request }) => handleStripeWebhook(request),
    },
  },
});
