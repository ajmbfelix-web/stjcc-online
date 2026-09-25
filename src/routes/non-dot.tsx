import { createFileRoute } from "@tanstack/react-router";
import { TopicView, TOPICS } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["non-dot"];

export const Route = createFileRoute("/non-dot")({
  head: () => ({
    meta: [
      { title: pageTitle("Non-DOT drug tests") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/non-dot") }],
  }),
  component: () => <TopicView topic={topic} />,
});
