import { createFileRoute } from "@tanstack/react-router";
import { TopicView, TOPICS } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["breath-alcohol"];

export const Route = createFileRoute("/breath-alcohol")({
  head: () => ({
    meta: [
      { title: pageTitle("Breath alcohol") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/breath-alcohol") }],
  }),
  component: () => <TopicView topic={topic} />,
});
