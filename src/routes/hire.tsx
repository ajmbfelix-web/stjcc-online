import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["hire"];

export const Route = createFileRoute("/hire")({
  head: () => ({
    meta: [
      { title: pageTitle("Hire screens") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/hire") }],
  }),
  component: () => <TopicView topic={topic} />,
});
