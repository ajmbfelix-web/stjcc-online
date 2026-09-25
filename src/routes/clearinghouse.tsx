import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["clearinghouse"];

export const Route = createFileRoute("/clearinghouse")({
  head: () => ({
    meta: [
      { title: pageTitle("Clearinghouse") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/clearinghouse") }],
  }),
  component: () => <TopicView topic={topic} />,
});
