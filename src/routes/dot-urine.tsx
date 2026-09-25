import { createFileRoute } from "@tanstack/react-router";
import { TopicView, TOPICS } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["dot-urine"];

export const Route = createFileRoute("/dot-urine")({
  head: () => ({
    meta: [
      { title: pageTitle("DOT urine") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/dot-urine") }],
  }),
  component: () => <TopicView topic={topic} />,
});
