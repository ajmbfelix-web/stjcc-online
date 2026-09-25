import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["about"];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: pageTitle("About") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/about") }],
  }),
  component: () => <TopicView topic={topic} />,
});
