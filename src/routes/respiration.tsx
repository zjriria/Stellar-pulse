import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { clearPendingScores, getPendingScores, saveEvent } from "@/lib/craving-store";

export const Route = createFileRoute("/respiration")({
  head: () => ({
    meta: [
      { title: "4-7-8 Breathing — Stellar Pulse" },
      {
        name: "description",
        content: "4-7-8 breathing exercise to calm cravings.",
      },
    ],
  }),
  component: BreathScreen,
});

type Phase = "inspire" | "retiens" | "expire";

const PLAN: { phase: Phase; label: string; seconds: number }[] = [
  { phase: "inspire", label: "Breathe in", seconds: 4 },
  { phase: "retiens", label: "Hold", seconds: 7 },
  { phase: "expire", label: "Breathe out", seconds: 8 },
];

const TOTAL_CYCLES = 3;

function BreathScreen() {
  const navigate = useNavigate();
  const [cycle, setCycle] = useState(1);
  const [stepIdx, setStepIdx] = useState(0);
  const [remaining, setRemaining] = useState(PLAN[0].seconds);
  const [done, setDone] = useState(false);
  const [scoreApres, setScoreApres] = useState(3);
  const [saved, setSaved] = useState(false);
  const scoreAvantRef = useRef<number | null>(null);

  useEffect(() => {
    scoreAvantRef.current = getPendingScores().craving;
  }, []);

  useEffect(() => {
    if (done) return;
    if (remaining <= 0) {
      const nextStep = stepIdx + 1;
      if (nextStep >= PLAN.length) {
        if (cycle >= TOTAL_CYCLES) {
          setDone(true);
          return;
        }
        setCycle((c) => c + 1);
        setStepIdx(0);
        setRemaining(PLAN[0].seconds);
      } else {
        setStepIdx(nextStep);
        setRemaining(PLAN[nextStep].seconds);
      }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, stepIdx, cycle, done]);

  const current = PLAN[stepIdx];
  const scale = current.phase === "inspire" ? 1.4 : current.phase === "retiens" ? 1.4 : 0.8;
  const transition =
    current.phase === "retiens"
      ? "transform 0.4s ease"
      : `transform ${current.seconds}s ease-in-out`;

  const handleSave = () => {
    const avant = scoreAvantRef.current ?? scoreApres;
    saveEvent({
      date: new Date().toISOString(),
      kind: "craving",
      scoreAvant: avant,
      scoreApres,
    });
    clearPendingScores();
    setSaved(true);
  };

  if (done) {
    const avant = scoreAvantRef.current;
    const diff = avant !== null ? avant - scoreApres : null;

    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-8 pt-6">
        <header className="flex items-center">
          <Link
            to="/"
            aria-label="Back to Home"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface"
          >
            ←
          </Link>
          <h1 className="mr-3 text-base font-medium text-muted-foreground">Finish exercise</h1>
        </header>

        <section className="mt-10 rounded-3xl bg-surface p-6">
          <p className="text-sm text-muted-foreground">Now, how strong is the craving?</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-5xl font-semibold text-sage tabular-nums">{scoreApres}</span>
            <span className="text-sm text-muted-foreground">/ 10</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={scoreApres}
            onChange={(e) => setScoreApres(Number(e.target.value))}
            aria-label="Craving after exercise"
            className="mt-4 h-3 w-full appearance-none rounded-full bg-muted accent-[var(--sage)]"
          />
        </section>

        {saved && avant !== null && (
          <div className="mt-6 rounded-3xl bg-sage/15 p-6 text-center">
            <p className="text-lg font-semibold text-sage">
              From {avant} to {scoreApres}.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {diff !== null && diff > 0
                ? "Bravo. You rode the wave."
                : "It's normal. You endured, that's what matters."}
            </p>
          </div>
        )}

        {!saved ? (
          <button
            onClick={handleSave}
            className="mt-auto min-h-[64px] w-full rounded-2xl bg-sage text-base font-semibold text-sage-foreground transition active:scale-[0.98]"
          >
            Record this moment
          </button>
        ) : (
          <Link
            to="/"
            className="mt-auto flex min-h-[64px] w-full items-center justify-center rounded-2xl bg-ocean text-base font-semibold text-ocean-foreground transition active:scale-[0.98]"
          >
            Back to Home
          </Link>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-8 pt-6">
      <header className="flex items-center">
        <Link
          to="/compagnon"
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface"
        >
          ←
        </Link>
        <h1 className="mr-3 text-base font-medium text-muted-foreground">
          Cycle {cycle} / {TOTAL_CYCLES}
        </h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className="flex h-56 w-56 items-center justify-center rounded-full bg-ocean/20 ring-1 ring-ocean/40"
          style={{ transform: `scale(${scale})`, transition }}
          aria-hidden="true"
        >
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-ocean/40">
            <span className="text-3xl font-semibold tabular-nums">{remaining}</span>
          </div>
        </div>

        <p aria-live="polite" className="mt-10 text-2xl font-medium tracking-wide text-ocean">
          {current.label}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Let the circle guide you.</p>
      </div>
    </main>
  );
}
