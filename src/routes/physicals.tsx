import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["physicals"];

export const Route = createFileRoute("/physicals")({
  head: () => ({
    meta: [
      { title: pageTitle("Physicals") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/physicals") }],
  }),
  component: () => <TopicView topic={topic} />,
});
