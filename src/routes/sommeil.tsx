import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Lightbulb, MoonStar, Sunrise } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { getLatestTelemetry, getMissionContext } from "@/lib/mission-health-store";
import {
  addSleepEntry,
  computeDuration,
  formatDuration,
  getSleepLog,
  type SleepEntry,
} from "@/lib/sleep-store";

export const Route = createFileRoute("/sommeil")({
  head: () => ({
    meta: [
      { title: "Circadian Sleep — Stellar Pulse" },
      {
        name: "description",
        content: "Circadian alignment and sleep architecture for behavioral readiness.",
      },
    ],
  }),
  component: SleepScreen,
});

function SleepScreen() {
  const context = useMemo(getMissionContext, []);
  const reading = useMemo(getLatestTelemetry, []);
  const [log, setLog] = useState<SleepEntry[]>(() => getSleepLog());
  const [bedtime, setBedtime] = useState("22:30");
  const [wake, setWake] = useState("05:06");
  const [quality, setQuality] = useState(3);
  const [lightMode, setLightMode] = useState<"wake" | "focus" | "wind-down">("focus");
  const duration = computeDuration(bedtime, wake);

  const saveNight = (event: React.FormEvent) => {
    event.preventDefault();
    addSleepEntry({
      date: new Date().toISOString(),
      bedtime,
      wake,
      quality,
    });
    setLog(getSleepLog());
  };

  return (
    <main className="mission-shell min-h-screen pb-28">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <header className="mission-header">
          <div>
            <p className="telemetry-label">Sol {context.missionDay} · Sleep behavior</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">Circadian alignment</h1>
          </div>
          <MoonStar className="h-5 w-5 text-indigo-600" />
        </header>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SleepMetric label="Last sleep" value={`${reading.sleepHours} h`} caution />
          <SleepMetric label="Alignment" value={`${reading.circadianAlignment}%`} caution />
          <SleepMetric label="Sleep debt" value={`${reading.sleepDebtHours} h`} caution />
          <SleepMetric label="Mood risk" value="Moderate" />
        </section>

        <section className="mission-panel mt-4 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="telemetry-label">Cabin light protocol</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">Light cycle</h2>
            </div>
            <Lightbulb className="h-5 w-5 text-amber-600" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { id: "wake" as const, label: "Wake", time: "06:00", color: "bg-sky-100" },
              { id: "focus" as const, label: "Focus", time: "10:00", color: "bg-white" },
              { id: "wind-down" as const, label: "Wind-down", time: "20:30", color: "bg-amber-50" },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setLightMode(mode.id)}
                className={`rounded-xl border p-3 text-left ${mode.color} ${
                  lightMode === mode.id ? "border-sky-500 ring-1 ring-sky-500" : "border-slate-200"
                }`}
              >
                <p className="text-xs font-medium text-slate-800">{mode.label}</p>
                <p className="mt-1 font-mono text-[10px] text-slate-500">{mode.time}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mission-panel mt-4 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="telemetry-label">Sleep log</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">Record sleep</h2>
            </div>
            <Sunrise className="h-5 w-5 text-sky-700" />
          </div>
          <form onSubmit={saveNight} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <TimeField label="Sleep" value={bedtime} onChange={setBedtime} />
              <TimeField label="Wake" value={wake} onChange={setWake} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Duration <span className="font-mono text-sky-700">{formatDuration(duration)}</span>
              </p>
              <div className="flex gap-1.5" aria-label="Sleep quality">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setQuality(value)}
                    aria-label={`Quality ${value}`}
                    className={`h-7 w-7 rounded-full border ${
                      quality >= value ? "border-indigo-500 bg-indigo-100" : "border-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <button type="submit" className="mission-cta mt-0 w-full justify-center">
              <Check className="h-4 w-4" />
              Save sleep
            </button>
          </form>
          {log.length > 0 && (
            <p className="mt-4 text-center text-xs text-slate-500">
              {log.length} sleep {log.length === 1 ? "entry" : "entries"} stored
            </p>
          )}
        </section>
      </div>
      <BottomNav />
    </main>
  );
}

function SleepMetric({
  label,
  value,
  caution = false,
}: {
  label: string;
  value: string;
  caution?: boolean;
}) {
  return (
    <div className="mission-panel p-4">
      <span className={`metric-status ${caution ? "telemetry-caution" : "telemetry-nominal"}`} />
      <p className="mt-4 font-mono text-xl text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs text-slate-500">
      {label}
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-900"
      />
    </label>
  );
}
