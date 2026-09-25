import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["mvr"];

export const Route = createFileRoute("/mvr")({
  head: () => ({
    meta: [
      { title: pageTitle("Motor vehicle records") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/mvr") }],
  }),
  component: () => <TopicView topic={topic} />,
});
