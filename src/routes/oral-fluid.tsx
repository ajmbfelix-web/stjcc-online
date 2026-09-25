import { createFileRoute } from "@tanstack/react-router";
import { TopicView, TOPICS } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["oral-fluid"];

export const Route = createFileRoute("/oral-fluid")({
  head: () => ({
    meta: [
      { title: pageTitle("Oral fluid") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/oral-fluid") }],
  }),
  component: () => <TopicView topic={topic} />,
});
