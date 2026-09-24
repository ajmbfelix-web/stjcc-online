import { createFileRoute } from "@tanstack/react-router";
import { EnrollForm } from "@/components/enroll-form";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/onboarding/hire")({
  head: () => ({ meta: [{ title: pageTitle("Hire-screen enrollment") }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <EnrollForm program="hire" />,
});
