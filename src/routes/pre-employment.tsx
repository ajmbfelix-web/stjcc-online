import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["pre-employment"];

export const Route = createFileRoute("/pre-employment")({
  head: () => ({
    meta: [
      { title: pageTitle("Pre-employment") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/pre-employment") }],
  }),
  component: () => <TopicView topic={topic} />,
});
