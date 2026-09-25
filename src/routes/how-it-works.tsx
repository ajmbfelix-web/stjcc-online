import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["how-it-works"];

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: pageTitle("How it works") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/how-it-works") }],
  }),
  component: () => <TopicView topic={topic} />,
});
