import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/bilan")({
  beforeLoad: () => {
    throw redirect({ to: "/check-in" });
  },
});
