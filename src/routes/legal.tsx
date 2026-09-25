import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["legal"];

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: pageTitle("Legal") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/legal") }],
  }),
  component: () => <TopicView topic={topic} />,
});
