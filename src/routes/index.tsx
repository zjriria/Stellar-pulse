import { createFileRoute } from "@tanstack/react-router";
import { StellarWellness } from "@/components/StellarWellness";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stellar Pulse — Astronaut Self-Care" },
      {
        name: "description",
        content:
          "A calming, private self-care and relaxation companion for long-duration space crews.",
      },
    ],
  }),
  component: StellarWellness,
});
