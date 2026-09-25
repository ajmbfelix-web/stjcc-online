import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/fleets")({
  component: () => <Navigate to="/consortium" />,
});
