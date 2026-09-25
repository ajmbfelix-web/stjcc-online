import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["driver-files"];

export const Route = createFileRoute("/driver-files")({
  head: () => ({
    meta: [
      { title: pageTitle("Driver files") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/driver-files") }],
  }),
  component: () => <TopicView topic={topic} />,
});
