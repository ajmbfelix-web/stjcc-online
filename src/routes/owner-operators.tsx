import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["owner-operators"];

export const Route = createFileRoute("/owner-operators")({
  head: () => ({
    meta: [
      { title: pageTitle("Owner-operators") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/owner-operators") }],
  }),
  component: () => <TopicView topic={topic} />,
});
