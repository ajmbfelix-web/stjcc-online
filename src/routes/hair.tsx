import { createFileRoute } from "@tanstack/react-router";
import { TopicView, TOPICS } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["hair"];

export const Route = createFileRoute("/hair")({
  head: () => ({
    meta: [
      { title: pageTitle("Hair testing") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/hair") }],
  }),
  component: () => <TopicView topic={topic} />,
});
