import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["backgrounds"];

export const Route = createFileRoute("/backgrounds")({
  head: () => ({
    meta: [
      { title: pageTitle("Backgrounds") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/backgrounds") }],
  }),
  component: () => <TopicView topic={topic} />,
});
