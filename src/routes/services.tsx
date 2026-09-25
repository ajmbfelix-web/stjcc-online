import { createFileRoute } from "@tanstack/react-router";
import { TopicView, TOPICS } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["services"];

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: pageTitle("Services") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/services") }],
  }),
  component: () => <TopicView topic={topic} />,
});
