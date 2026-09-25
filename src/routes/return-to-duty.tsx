import { createFileRoute } from "@tanstack/react-router";
import { TopicView, TOPICS } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["return-to-duty"];

export const Route = createFileRoute("/return-to-duty")({
  head: () => ({
    meta: [
      { title: pageTitle("Return to duty") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/return-to-duty") }],
  }),
  component: () => <TopicView topic={topic} />,
});
