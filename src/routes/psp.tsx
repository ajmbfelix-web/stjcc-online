import { createFileRoute } from "@tanstack/react-router";
import { TopicView, TOPICS } from "@/components/topic";
import { canonical, pageTitle } from "@/lib/seo";

const topic = TOPICS["psp"];

export const Route = createFileRoute("/psp")({
  head: () => ({
    meta: [
      { title: pageTitle("PSP records") },
      { name: "description", content: topic.description },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/psp") }],
  }),
  component: () => <TopicView topic={topic} />,
});
