import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { NotebookPen, Waves } from "lucide-react";
import { saveVictory } from "@/lib/victories-store";
import { saveEvent } from "@/lib/craving-store";

const TOTAL = 15 * 60;

function fmt(s: number) {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${ss}`;
}

export function UrgeSurfingTimer() {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (elapsed >= TOTAL) return;
    const t = setInterval(() => setElapsed((e) => Math.min(TOTAL, e + 1)), 1000);
    return () => clearInterval(t);
  }, [elapsed]);

  const remaining = TOTAL - elapsed;
  const ratio = elapsed / TOTAL;
  const R = 130;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - ratio);

  const passed = () => {
    saveVictory("Urge passed — 15 minutes");
    navigate({ to: "/resilience" });
  };
  const logged = () => {
    saveEvent({
      date: new Date().toISOString(),
      kind: "craving",
      scoreAvant: 8,
      scoreApres: 8,
    });
    navigate({ to: "/resilience" });
  };

  return (
    <div className="relative flex flex-col items-center">
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-32 h-80 w-80 -translate-x-1/2 rounded-full bg-sage/15 blur-3xl animate-[pulse_6s_ease-in-out_infinite]"
      />
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-36 h-72 w-72 -translate-x-1/2 rounded-full bg-ocean/10 blur-2xl animate-[pulse_8s_ease-in-out_infinite]"
      />

      <div className="relative flex h-80 w-80 items-center justify-center">
        <svg viewBox="0 0 300 300" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle
            cx="150"
            cy="150"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth="6"
            className="text-foreground"
          />
          <circle
            cx="150"
            cy="150"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            className="text-ocean transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <div className="flex flex-col items-center text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Surf the urge
          </p>
          <p className="mt-2 text-6xl font-bold tabular-nums text-foreground">{fmt(remaining)}</p>
          <p className="mt-3 max-w-[180px] text-xs text-muted-foreground">
            Stay here, breathe. The craving will subside.
          </p>
        </div>
      </div>

      <div className="mt-10 w-full max-w-md space-y-3">
        <button
          onClick={passed}
          className="flex min-h-[64px] w-full items-center justify-center gap-2 rounded-2xl bg-ocean px-5 text-base font-semibold text-ocean-foreground transition active:scale-[0.98]"
        >
          <Waves className="h-5 w-5" />
          🌊 The urge passed
        </button>
        <button
          onClick={logged}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <NotebookPen className="h-4 w-4" />
          📓 I gave in, log it
        </button>
      </div>
    </div>
  );
}
