import { useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";

type Phase = { label: string; seconds: number; scale: number };

const PHASES: Phase[] = [
  { label: "Inhale", seconds: 4, scale: 1.5 },
  { label: "Hold", seconds: 4, scale: 1.5 },
  { label: "Exhale", seconds: 4, scale: 1 },
  { label: "Hold", seconds: 4, scale: 1 },
];

export function BoxBreathing() {
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState(PHASES[0].seconds);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        setIdx((i) => {
          const next = (i + 1) % PHASES.length;
          setRemaining(PHASES[next].seconds);
          return next;
        });
        return PHASES[(idx + 1) % PHASES.length].seconds;
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [running, idx]);

  const start = () => {
    setIdx(0);
    setRemaining(PHASES[0].seconds);
    setRunning(true);
  };
  const stop = () => {
    setRunning(false);
    setIdx(0);
    setRemaining(PHASES[0].seconds);
  };

  const current = PHASES[idx];
  const scale = running ? current.scale : 1;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-72 w-72 items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute h-full w-full rounded-full bg-ocean/10 blur-2xl"
          style={{
            transform: `scale(${scale})`,
            transition: "transform 4s ease-in-out",
          }}
        />
        <div
          className="flex h-48 w-48 items-center justify-center rounded-full bg-ocean/15 ring-1 ring-ocean/30 backdrop-blur-sm"
          style={{
            transform: `scale(${scale})`,
            transition: "transform 4s ease-in-out",
          }}
        >
          <div className="flex flex-col items-center text-center">
            <p aria-live="polite" className="text-2xl font-semibold text-ocean">
              {running ? current.label : "Ready?"}
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums text-foreground/80">
              {running ? remaining : "·"}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-6 max-w-xs text-center text-xs text-muted-foreground">
        4·4·4·4 box breathing. Just follow the circle.
      </p>

      <div className="mt-6 flex w-full max-w-xs gap-3">
        {!running ? (
          <button
            onClick={start}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ocean px-5 py-3.5 text-sm font-semibold text-ocean-foreground transition active:scale-[0.98]"
          >
            <Play className="h-4 w-4" /> Start
          </button>
        ) : (
          <button
            onClick={stop}
            className="glass flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-foreground transition active:scale-[0.98]"
          >
            <Square className="h-4 w-4" /> Stop
          </button>
        )}
      </div>
    </div>
  );
}
