import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["ucr"];

export const Route = createFileRoute("/ucr")({
  head: () => ({
    meta: [
      { title: pageTitle("UCR") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/ucr") }],
  }),
  component: () => <TopicView topic={topic} />,
});
