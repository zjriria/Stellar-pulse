import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/resilience")({
  beforeLoad: () => {
    throw redirect({ to: "/protocols" });
  },
});
