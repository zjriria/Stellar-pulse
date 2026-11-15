import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  durationSec?: number;
};

function fmt(s: number) {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${ss}`;
}

export function AudioPlayer({ title, subtitle, durationSec = 180 }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= durationSec) {
          setPlaying(false);
          return durationSec;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing, durationSec]);

  const progress = (elapsed / durationSec) * 100;

  const onScrub = (clientX: number) => {
    const el = barRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    setElapsed(Math.round(ratio * durationSec));
  };

  return (
    <div className="glass rounded-3xl p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (elapsed >= durationSec) setElapsed(0);
            setPlaying((p) => !p);
          }}
          aria-label={playing ? "Pause" : "Play"}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ocean text-ocean-foreground transition active:scale-95"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          {subtitle && <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        <button
          onClick={() => {
            setPlaying(false);
            setElapsed(0);
          }}
          aria-label="Restart"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={barRef}
        onClick={(e) => onScrub(e.clientX)}
        className="mt-3 h-1 w-full cursor-pointer rounded-full bg-foreground/10"
      >
        <div
          className="h-1 rounded-full bg-ocean transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] tabular-nums text-muted-foreground">
        <span>{fmt(elapsed)}</span>
        <span>{fmt(durationSec)}</span>
      </div>
    </div>
  );
}
