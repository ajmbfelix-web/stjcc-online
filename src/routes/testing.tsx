import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["testing"];

export const Route = createFileRoute("/testing")({
  head: () => ({
    meta: [
      { title: pageTitle("Testing") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/testing") }],
  }),
  component: () => <TopicView topic={topic} />,
});
