import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["consortium"];

export const Route = createFileRoute("/consortium")({
  head: () => ({
    meta: [
      { title: pageTitle("Consortium") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/consortium") }],
  }),
  component: () => <TopicView topic={topic} />,
});
