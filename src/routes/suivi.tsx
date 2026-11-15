import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, Brain, BrainCircuit, ScanFace } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { TelemetryBadge } from "@/components/TelemetryBadge";
import {
  getCrewRoutine,
  getLatestTelemetry,
  getMissionContext,
  getOverallTriage,
  getReadinessScore,
  getTelemetry,
  type TelemetryReading,
} from "@/lib/mission-health-store";

export const Route = createFileRoute("/suivi")({
  head: () => ({
    meta: [
      { title: "Longitudinal Telemetry — Stellar Pulse" },
      {
        name: "description",
        content: "Mission Sol trends for sleep, autonomic recovery, mood, and cognitive readiness.",
      },
    ],
  }),
  component: TrendsScreen,
});

type Range = 7 | 14;

function TrendsScreen() {
  const allTelemetry = useMemo(getTelemetry, []);
  const context = useMemo(getMissionContext, []);
  const latest = useMemo(getLatestTelemetry, []);
  const [range, setRange] = useState<Range>(14);
  const data = allTelemetry.slice(-range).map((reading) => ({
    ...reading,
  }));
  const overall = getOverallTriage(latest);

  return (
    <main className="mission-shell min-h-screen pb-28">
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              aria-label="Back to mission dashboard"
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 text-slate-500 transition hover:border-sky-500/50 hover:text-sky-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="telemetry-label">Stellar Pulse · Sol {context.missionDay}</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
                Longitudinal telemetry
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-slate-300 p-1">
              {([7, 14] as Range[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRange(value)}
                  className={`rounded-md px-3 py-1.5 font-mono text-[10px] transition ${
                    range === value ? "bg-sky-600 text-white" : "text-slate-500"
                  }`}
                >
                  {value} SOL
                </button>
              ))}
            </div>
            <TelemetryBadge level={overall} compact />
          </div>
        </header>

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Summary
            label="Mindset"
            value={getReadinessScore(latest, getCrewRoutine())}
            unit="/100"
            note="-4 over 7 Sol"
            Icon={Brain}
          />
          <Summary
            label="Mood & affect"
            value={Math.round(average(data, "affectStability"))}
            unit="%"
            note="Stable expression"
            Icon={ScanFace}
          />
          <Summary
            label="Stress load"
            value={Math.round(average(data, "neuroStressMs"))}
            unit="ms"
            note="7-Sol HRV baseline"
            Icon={BrainCircuit}
          />
          <Summary
            label="Vigilance"
            value={latest.cognitiveVigilance}
            unit="%"
            note="Reaction nominal"
            Icon={Brain}
          />
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <TrendPanel eyebrow="Behavioral stress" title="Neuro-stress load">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#d6e3eb" strokeDasharray="2 5" vertical={false} />
                <XAxis
                  dataKey="sol"
                  stroke="#70859a"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `S${v}`}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#70859a"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip content={<TelemetryTooltip />} />
                <Line
                  type="monotone"
                  dataKey="neuroStressMs"
                  name="HRV"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TrendPanel>

          <TrendPanel eyebrow="Sleep behavior" title="Circadian alignment">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sleep-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#d6e3eb" strokeDasharray="2 5" vertical={false} />
                <XAxis
                  dataKey="sol"
                  stroke="#70859a"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `S${v}`}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#70859a"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip content={<TelemetryTooltip />} />
                <Area
                  type="monotone"
                  dataKey="circadianAlignment"
                  name="Alignment"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  fill="url(#sleep-fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TrendPanel>

          <TrendPanel eyebrow="Behavioral health" title="Mood valence">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#d6e3eb" strokeDasharray="2 5" vertical={false} />
                <XAxis
                  dataKey="sol"
                  stroke="#70859a"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `S${v}`}
                />
                <YAxis
                  domain={[0, 10]}
                  stroke="#70859a"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip content={<TelemetryTooltip />} />
                <Line
                  type="monotone"
                  dataKey="affectStability"
                  name="Mood & affect"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </TrendPanel>

          <TrendPanel eyebrow="Cognitive performance" title="Cognitive vigilance">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="readiness-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#d6e3eb" strokeDasharray="2 5" vertical={false} />
                <XAxis
                  dataKey="sol"
                  stroke="#70859a"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `S${v}`}
                />
                <YAxis
                  domain={[40, 100]}
                  stroke="#70859a"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip content={<TelemetryTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cognitiveVigilance"
                  name="Vigilance"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fill="url(#readiness-fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TrendPanel>
        </section>

        <p className="mt-5 text-center text-[11px] text-slate-500">Demonstration data only.</p>
      </div>
      <BottomNav />
    </main>
  );
}

function average(data: TelemetryReading[], key: keyof TelemetryReading) {
  return data.reduce((sum, item) => sum + Number(item[key]), 0) / Math.max(1, data.length);
}

function Summary({
  label,
  value,
  unit,
  note,
  Icon,
}: {
  label: string;
  value: string | number;
  unit: string;
  note: string;
  Icon: typeof Brain;
}) {
  return (
    <div className="mission-panel p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="telemetry-label">{label}</p>
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <p className="mt-4 font-mono text-2xl text-slate-950 sm:text-3xl">
        {value}
        <span className="ml-1 text-[10px] text-slate-500">{unit}</span>
      </p>
      <p className="mt-2 text-[11px] text-slate-500">{note}</p>
    </div>
  );
}

function TrendPanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mission-panel overflow-hidden p-5 sm:p-6">
      <p className="telemetry-label">{eyebrow}</p>
      <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 -ml-2">{children}</div>
    </div>
  );
}

function TelemetryTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-300 bg-white/95 p-3 shadow-xl">
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Sol {label}</p>
      {payload.map((item) => (
        <p key={item.name} className="mt-1 font-mono text-xs" style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}
