import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["boc-3"];

export const Route = createFileRoute("/boc-3")({
  head: () => ({
    meta: [
      { title: pageTitle("BOC-3") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/boc-3") }],
  }),
  component: () => <TopicView topic={topic} />,
});
