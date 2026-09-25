import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["faq"];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: pageTitle("FAQ") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/faq") }],
  }),
  component: () => <TopicView topic={topic} />,
});
