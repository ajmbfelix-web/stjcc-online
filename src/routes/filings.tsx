import { createFileRoute } from "@tanstack/react-router";
import { TOPICS, TopicView } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["filings"];

export const Route = createFileRoute("/filings")({
  head: () => ({
    meta: [
      { title: pageTitle("Filings") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/filings") }],
  }),
  component: () => <TopicView topic={topic} />,
});
