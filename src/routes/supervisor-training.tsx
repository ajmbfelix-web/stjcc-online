import { createFileRoute } from "@tanstack/react-router";
import { TopicView, TOPICS } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["supervisor-training"];

export const Route = createFileRoute("/supervisor-training")({
  head: () => ({
    meta: [
      { title: pageTitle("Supervisor training") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/supervisor-training") }],
  }),
  component: () => <TopicView topic={topic} />,
});
