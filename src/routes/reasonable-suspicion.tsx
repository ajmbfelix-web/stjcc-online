import { createFileRoute } from "@tanstack/react-router";
import { TopicView, TOPICS } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["reasonable-suspicion"];

export const Route = createFileRoute("/reasonable-suspicion")({
  head: () => ({
    meta: [
      { title: pageTitle("Reasonable suspicion") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/reasonable-suspicion") }],
  }),
  component: () => <TopicView topic={topic} />,
});
