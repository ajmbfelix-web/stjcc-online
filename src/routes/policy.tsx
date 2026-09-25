import { createFileRoute } from "@tanstack/react-router";
import { TopicView, TOPICS } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["policy"];

export const Route = createFileRoute("/policy")({
  head: () => ({
    meta: [
      { title: pageTitle("Drug and alcohol policy") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/policy") }],
  }),
  component: () => <TopicView topic={topic} />,
});
