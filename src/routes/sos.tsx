import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  clearPendingScores,
  getPendingScores,
  saveEvent,
  saveScorePoint,
  type Kind,
} from "@/lib/craving-store";

type Search = { mode: Kind };

export const Route = createFileRoute("/sos")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const mode = s.mode === "anxiety" || s.mode === "craving" ? s.mode : "craving";
    return { mode };
  },
  head: () => ({
    meta: [
      { title: "SOS — 4-7-8 Breathing — Stellar Pulse" },
      {
        name: "description",
        content: "Guided 4-7-8 breathing to get through a moment of anxiety or craving.",
      },
    ],
  }),
  component: SOSScreen,
});

type Phase = "inspire" | "bloque" | "expire";

const PLAN: { phase: Phase; label: string; seconds: number }[] = [
  { phase: "inspire", label: "Breathe in…", seconds: 4 },
  { phase: "bloque", label: "Hold breath…", seconds: 7 },
  { phase: "expire", label: "Breathe out…", seconds: 8 },
];

const COPY: Record<Kind, { header: string; sub: string; finishLabel: string }> = {
  anxiety: {
    header: "Anxiety will go down.",
    sub: "Just breathe, that's it.",
    finishLabel: "I feel a bit better",
  },
  craving: {
    header: "This craving is a wave.",
    sub: "It rises, it falls. You don't have to follow it.",
    finishLabel: "The wave has passed",
  },
};

function SOSScreen() {
  const navigate = useNavigate();
  const { mode } = Route.useSearch();
  const [stepIdx, setStepIdx] = useState(0);
  const [remaining, setRemaining] = useState(PLAN[0].seconds);

  useEffect(() => {
    if (remaining <= 0) {
      const next = (stepIdx + 1) % PLAN.length;
      setStepIdx(next);
      setRemaining(PLAN[next].seconds);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, stepIdx]);

  const current = PLAN[stepIdx];
  const scale = current.phase === "inspire" ? 1.5 : current.phase === "bloque" ? 1.5 : 0.7;
  const transition =
    current.phase === "bloque"
      ? "transform 0.4s ease"
      : `transform ${current.seconds}s ease-in-out`;

  const finish = () => {
    const pending = getPendingScores();
    const avant = mode === "anxiety" ? pending.anxiety : pending.craving;
    if (avant !== null) {
      const apres = Math.max(0, avant - 3);
      saveEvent({
        date: new Date().toISOString(),
        kind: mode,
        scoreAvant: avant,
        scoreApres: apres,
      });
      saveScorePoint(mode, apres);
    }
    clearPendingScores();
    navigate({ to: "/" });
  };

  const copy = COPY[mode as Kind];
  const ring = mode === "anxiety" ? "bg-ocean/25 ring-ocean/40" : "bg-sage/25 ring-sage/40";
  const inner =
    mode === "anxiety" ? "bg-ocean/50 text-ocean-foreground" : "bg-sage/50 text-sage-foreground";
  const label = mode === "anxiety" ? "text-ocean" : "text-sage";
  const button =
    mode === "anxiety" ? "bg-ocean text-ocean-foreground" : "bg-sage text-sage-foreground";

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-between bg-background px-6 pb-10 pt-10">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          4 · 7 · 8 Breathing
        </p>
        <p className={`mt-3 text-lg font-medium ${label}`}>{copy.header}</p>
        <p className="mt-1 text-sm text-muted-foreground">{copy.sub}</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className={`flex h-64 w-64 items-center justify-center rounded-full ring-1 ${ring}`}
          style={{ transform: `scale(${scale})`, transition }}
          aria-hidden="true"
        >
          <div className={`flex h-40 w-40 items-center justify-center rounded-full ${inner}`}>
            <span className="text-4xl font-semibold tabular-nums">{remaining}</span>
          </div>
        </div>

        <p aria-live="polite" className={`mt-12 text-3xl font-medium tracking-wide ${label}`}>
          {current.label}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Let the circle guide you.</p>
      </div>

      <button
        onClick={finish}
        className={`min-h-[64px] w-full max-w-md rounded-2xl text-base font-semibold transition active:scale-[0.98] ${button}`}
      >
        {copy.finishLabel}
      </button>
    </main>
  );
}
