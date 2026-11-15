import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Sparkles } from "lucide-react";
import {
  computeWeekStats,
  getEncouragement,
  markWeeklyReviewSeen,
  type WeekStats,
} from "@/lib/weekly-review";
import { generateProgram } from "@/lib/program-store";

export function WeeklyReviewCard({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="mt-3 w-full rounded-3xl bg-gradient-to-r from-ocean/20 to-sage/20 p-5 text-right transition active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ocean text-ocean-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-wide text-ocean">New</p>
          <p className="text-sm font-semibold">Your weekly review is ready</p>
          <p className="text-xs text-muted-foreground">Open it to see your progress.</p>
        </div>
      </div>
    </button>
  );
}

export function WeeklyReviewModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<WeekStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStats(computeWeekStats());
  }, []);

  const generate = () => {
    setLoading(true);
    setTimeout(() => {
      generateProgram();
      markWeeklyReviewSeen();
      onClose();
      navigate({ to: "/resilience" });
    }, 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Weekly Review"
      className="fixed inset-0 z-50 flex items-end bg-background/90 backdrop-blur sm:items-center sm:justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-6 sm:rounded-3xl"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-ocean border-t-transparent" />
            <p className="mt-6 text-base font-medium">Reading your progress…</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Building the right program for you.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Weekly Review
              </p>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-lg font-medium leading-snug">{getEncouragement()}</p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <Stat label="Avg Craving" value={stats?.avgCraving ?? 0} accent="sage" suffix="/10" />
              <Stat label="SOS Used" value={stats?.sosCount ?? 0} accent="ocean" />
              <Stat label="Clean Days" value={stats?.cleanDays ?? 0} accent="sage" suffix="/7" />
            </div>

            <button
              onClick={generate}
              className="mt-6 min-h-[64px] w-full rounded-2xl bg-ocean text-base font-semibold text-ocean-foreground transition active:scale-[0.98]"
            >
              Build my program for next week
            </button>
            <button
              onClick={onClose}
              className="mt-2 w-full py-3 text-center text-xs text-muted-foreground"
            >
              Later
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  suffix,
}: {
  label: string;
  value: number;
  accent: "ocean" | "sage";
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl bg-background p-3 text-center">
      <p
        className={`text-2xl font-semibold tabular-nums ${accent === "ocean" ? "text-ocean" : "text-sage"}`}
      >
        {value}
        {suffix && <span className="ml-0.5 text-xs text-muted-foreground">{suffix}</span>}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
