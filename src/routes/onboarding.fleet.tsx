import { createFileRoute } from "@tanstack/react-router";
import { EnrollForm } from "@/components/enroll-form";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/onboarding/fleet")({
  head: () => ({ meta: [{ title: pageTitle("Fleet enrollment") }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <EnrollForm program="fleet" />,
});
