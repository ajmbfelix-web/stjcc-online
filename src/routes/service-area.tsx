import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["service-area"];

export const Route = createFileRoute("/service-area")({
  head: () => ({
    meta: [
      { title: pageTitle("Service area") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/service-area") }],
  }),
  component: () => <TopicView topic={topic} />,
});
