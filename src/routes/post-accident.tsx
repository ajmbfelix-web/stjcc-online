import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["post-accident"];

export const Route = createFileRoute("/post-accident")({
  head: () => ({
    meta: [
      { title: pageTitle("Post-accident") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/post-accident") }],
  }),
  component: () => <TopicView topic={topic} />,
});
