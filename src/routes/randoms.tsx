import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["randoms"];

export const Route = createFileRoute("/randoms")({
  head: () => ({
    meta: [
      { title: pageTitle("Random testing") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/randoms") }],
  }),
  component: () => <TopicView topic={topic} />,
});
