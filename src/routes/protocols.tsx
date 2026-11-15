import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Brain, Check, Lightbulb, Trees, X } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { TelemetryBadge } from "@/components/TelemetryBadge";
import {
  applyProtocolImpact,
  calculateMindsetScore,
  getCrewRoutine,
  getLatestTelemetry,
  getMissionContext,
  getPriorityCountermeasure,
  type CrewRoutineState,
  type ProtocolId,
  type TriageLevel,
} from "@/lib/mission-health-store";

export const Route = createFileRoute("/protocols")({
  head: () => ({
    meta: [
      { title: "Mental Countermeasures — Stellar Pulse" },
      {
        name: "description",
        content: "Zero-medication behavioral protocols for deep-space crews.",
      },
    ],
  }),
  component: ProtocolsScreen,
});

type Protocol = {
  id: ProtocolId;
  title: string;
  detail: string;
  duration: string;
  level: TriageLevel;
  Icon: typeof Brain;
};

const PROTOCOLS: Protocol[] = [
  {
    id: "breathing",
    title: "Autonomic Breathing",
    detail: "Guided stress down-regulation",
    duration: "3 min",
    level: "caution",
    Icon: Brain,
  },
  {
    id: "light",
    title: "Circadian Light Shift",
    detail: "Adjust cabin LED wavelength for 2h sleep debt",
    duration: "20 min",
    level: "caution",
    Icon: Lightbulb,
  },
  {
    id: "sensory",
    title: "Earth Sensory Reset",
    detail: "Nature audio & visual immersion",
    duration: "5 min",
    level: "nominal",
    Icon: Trees,
  },
];

function ProtocolsScreen() {
  const context = useMemo(getMissionContext, []);
  const [routine, setRoutine] = useState<CrewRoutineState>(() => getCrewRoutine());
  const [reading, setReading] = useState(() => getLatestTelemetry());
  const [active, setActive] = useState<Protocol | null>(null);
  const completed = routine.completedProtocols.length;
  const progress = Math.round((completed / PROTOCOLS.length) * 100);
  const mindsetScore = calculateMindsetScore(reading, routine);
  const priority = getPriorityCountermeasure(reading);

  const completeProtocol = () => {
    if (!active) return;
    const snapshot = applyProtocolImpact(active.id);
    setReading(snapshot.reading);
    setRoutine(snapshot.routine);
    setActive(null);
  };

  return (
    <main className="mission-shell min-h-screen pb-24">
      <div className="mx-auto max-w-xl px-4 pb-4 sm:px-6">
        <header className="mission-header min-h-14">
          <div>
            <p className="telemetry-label">
              Sol {context.missionDay} · {routine.streak} Sol streak
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-950">Mental protocols</h1>
          </div>
          <div className="text-right">
            <p className="font-mono text-xl text-sky-700">{mindsetScore}</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-500">Mindset</p>
          </div>
        </header>

        <section className="mission-panel mt-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="telemetry-label">Daily progress</p>
              <p className="mt-1 text-sm text-slate-700">
                {completed}/{PROTOCOLS.length} complete
              </p>
            </div>
            <span className="font-mono text-lg text-sky-700">{progress}%</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-sky-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        <section className="mt-3 space-y-2.5">
          {PROTOCOLS.map((protocol) => {
            const done = routine.completedProtocols.includes(protocol.id);
            const Icon = protocol.Icon;
            return (
              <button
                key={protocol.id}
                type="button"
                onClick={() => setActive(protocol)}
                className="mission-panel flex w-full items-center gap-3 p-4 text-left transition active:scale-[0.99]"
              >
                <span className="routine-icon">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-950">
                    {protocol.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">
                    {protocol.duration} · {protocol.detail}
                  </span>
                  {protocol.id === priority && !done && (
                    <span className="mt-1 block font-mono text-[9px] uppercase text-amber-700">
                      Priority
                    </span>
                  )}
                </span>
                {done ? (
                  <Check className="h-5 w-5 text-emerald-600" />
                ) : (
                  <TelemetryBadge level={protocol.level} compact />
                )}
              </button>
            );
          })}
        </section>
      </div>

      <BottomNav />

      {active && (
        <ProtocolModal
          protocol={active}
          complete={routine.completedProtocols.includes(active.id)}
          onClose={() => setActive(null)}
          onComplete={completeProtocol}
        />
      )}
    </main>
  );
}

function ProtocolModal({
  protocol,
  complete,
  onClose,
  onComplete,
}: {
  protocol: Protocol;
  complete: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/25 p-3 backdrop-blur-sm sm:place-items-center">
      <div className="mission-panel relative w-full max-w-md p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close protocol"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="telemetry-label">Active protocol</p>
        <h2 className="mt-2 pr-10 text-xl font-semibold text-slate-950">{protocol.title}</h2>
        <div className="my-8 grid place-items-center">
          <div className="protocol-pulse grid h-40 w-40 place-items-center rounded-full border border-sky-200 bg-sky-50">
            <span className="font-mono text-sm text-sky-700">
              {protocol.id === "breathing" ? "Breathe" : protocol.duration}
            </span>
          </div>
        </div>
        <p className="text-center text-sm text-slate-500">{protocol.detail}</p>
        <button
          type="button"
          onClick={complete ? onClose : onComplete}
          className="mission-cta mt-6 w-full justify-center"
        >
          <Check className="h-4 w-4" />
          {complete ? "Close Protocol" : "Complete Protocol"}
        </button>
      </div>
    </div>
  );
}
