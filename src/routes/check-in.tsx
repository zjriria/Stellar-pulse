import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Brain, Check, ScanFace, TimerReset, Users } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { TelemetryBadge } from "@/components/TelemetryBadge";
import {
  getLatestTelemetry,
  getMissionContext,
  getOverallTriage,
  recordCheckIn,
  type TelemetryReading,
} from "@/lib/mission-health-store";

export const Route = createFileRoute("/check-in")({
  head: () => ({
    meta: [
      { title: "Behavioral Check-in — Stellar Pulse" },
      {
        name: "description",
        content: "A 30-second mood, expression, and cognitive vigilance check.",
      },
    ],
  }),
  component: BehavioralCheckIn,
});

function BehavioralCheckIn() {
  const navigate = useNavigate();
  const context = useMemo(getMissionContext, []);
  const baseline = useMemo(getLatestTelemetry, []);
  const [form, setForm] = useState<TelemetryReading>({ ...baseline, sol: context.missionDay });
  const [step, setStep] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const [stimulusVisible, setStimulusVisible] = useState(false);
  const stimulusAt = useRef(0);
  const stimulusTimer = useRef<number | null>(null);
  const level = getOverallTriage(form);

  useEffect(
    () => () => {
      if (stimulusTimer.current) window.clearTimeout(stimulusTimer.current);
    },
    [],
  );

  const runScan = () => {
    setScanning(true);
    window.setTimeout(() => {
      setForm((current) => ({
        ...current,
        affectStability: 78,
        voiceStressPct: 33,
        facialStressPct: 31,
      }));
      setScanning(false);
      setScanDone(true);
    }, 2000);
  };

  const scheduleStimulus = () => {
    setStimulusVisible(false);
    stimulusTimer.current = window.setTimeout(
      () => {
        stimulusAt.current = performance.now();
        setStimulusVisible(true);
      },
      600 + Math.random() * 600,
    );
  };

  const startFocusTest = () => {
    setReactionTimes([]);
    setTestStarted(true);
    scheduleStimulus();
  };

  const captureReaction = () => {
    if (!stimulusVisible) return;
    const latency = Math.round(performance.now() - stimulusAt.current);
    const next = [...reactionTimes, latency];
    setReactionTimes(next);
    setStimulusVisible(false);
    if (next.length < 3) {
      scheduleStimulus();
      return;
    }
    const average = Math.round(next.reduce((sum, value) => sum + value, 0) / next.length);
    const snapshot = recordCheckIn({
      moodValence: form.moodValence,
      isolationStress: form.isolationStress,
      voiceStressPct: form.voiceStressPct,
      reactionMs: average,
    });
    setForm(snapshot.reading);
  };

  const finish = () => navigate({ to: "/" });

  const sections = [
    {
      eyebrow: "01 · Self-report",
      title: "How do you feel?",
      content: (
        <div className="space-y-7">
          <ScaleField
            label="Mood valence"
            low="Low"
            high="Positive"
            value={form.moodValence}
            onChange={(value) => setForm((current) => ({ ...current, moodValence: value }))}
            Icon={Brain}
          />
          <ScaleField
            label="Isolation load"
            low="Connected"
            high="Isolated"
            value={form.isolationStress}
            onChange={(value) => setForm((current) => ({ ...current, isolationStress: value }))}
            Icon={Users}
          />
        </div>
      ),
    },
    {
      eyebrow: "02 · Expression scan",
      title: "Voice & facial tone",
      content: (
        <div className="text-center">
          <div className="mx-auto grid h-36 w-36 place-items-center rounded-full border border-sky-200 bg-sky-50">
            <ScanFace className={`h-14 w-14 text-sky-700 ${scanning ? "animate-pulse" : ""}`} />
          </div>
          {scanDone ? (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <ScanResult label="Voice stress" value={`${form.voiceStressPct}%`} />
              <ScanResult label="Facial stress" value={`${form.facialStressPct}%`} />
            </div>
          ) : (
            <button
              type="button"
              onClick={runScan}
              disabled={scanning}
              className="mission-cta mx-auto mt-6 justify-center"
            >
              {scanning ? "Scanning…" : "Run 2-second scan"}
            </button>
          )}
          <p className="mt-4 text-xs text-slate-500">No audio or images are stored.</p>
        </div>
      ),
    },
    {
      eyebrow: "03 · Vigilance",
      title: "Three-tap focus check",
      content: (
        <div className="text-center">
          <button
            type="button"
            onClick={!testStarted ? startFocusTest : stimulusVisible ? captureReaction : undefined}
            disabled={reactionTimes.length >= 3}
            className={`mx-auto grid h-40 w-40 place-items-center rounded-full text-white shadow-lg transition ${
              reactionTimes.length >= 3
                ? "bg-emerald-600 shadow-emerald-200"
                : stimulusVisible
                  ? "scale-105 bg-sky-600 shadow-sky-200 active:scale-95"
                  : "bg-slate-300 shadow-slate-200"
            }`}
          >
            {reactionTimes.length >= 3 ? (
              <Check className="h-12 w-12" />
            ) : (
              <span className="flex flex-col items-center gap-2">
                <TimerReset className="h-10 w-10" />
                <span className="font-mono text-xs">
                  {!testStarted ? "Start" : stimulusVisible ? "Tap" : "Wait"}
                </span>
              </span>
            )}
          </button>
          <div className="mt-5 flex justify-center gap-2">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className={`h-2.5 w-2.5 rounded-full ${
                  index < reactionTimes.length ? "bg-sky-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <p className="mt-4 font-mono text-sm text-slate-500">
            {reactionTimes.length >= 3
              ? `${form.reactionScoreMs} ms · ${form.cognitiveVigilance}% vigilance`
              : testStarted
                ? `Stimulus ${Math.min(reactionTimes.length + 1, 3)} of 3`
                : "Tap start, then wait for blue"}
          </p>
        </div>
      ),
    },
  ];
  const active = sections[step];
  const canContinue = step !== 1 || scanDone;
  const canFinish = reactionTimes.length >= 3;

  return (
    <main className="mission-shell flex min-h-screen flex-col pb-24">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-4 sm:px-6">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/"
            aria-label="Back to Pulse"
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 text-slate-500"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="text-center">
            <p className="telemetry-label">30-second check-in</p>
            <p className="mt-1 text-sm text-slate-700">Sol {context.missionDay}</p>
          </div>
          <TelemetryBadge level={level} compact />
        </header>

        <div className="mt-8 flex gap-2" aria-label={`Step ${step + 1} of ${sections.length}`}>
          {sections.map((section, index) => (
            <span
              key={section.eyebrow}
              className={`h-1 flex-1 rounded-full ${index <= step ? "bg-sky-600" : "bg-slate-200"}`}
            />
          ))}
        </div>

        <section className="mission-panel mt-5 flex-1 p-5 sm:p-8">
          <p className="telemetry-label">{active.eyebrow}</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">{active.title}</h1>
          <div className="mt-9">{active.content}</div>
        </section>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
            className="min-h-12 rounded-lg border border-slate-300 px-5 text-sm text-slate-700 disabled:opacity-30"
          >
            Back
          </button>
          {step < sections.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((current) => current + 1)}
              disabled={!canContinue}
              className="mission-cta mt-0 min-w-32 justify-center disabled:opacity-40"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={!canFinish}
              className="mission-cta mt-0 min-w-32 justify-center disabled:opacity-40"
            >
              View Pulse
            </button>
          )}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}

function ScaleField({
  label,
  low,
  high,
  value,
  onChange,
  Icon,
}: {
  label: string;
  low: string;
  high: string;
  value: number;
  onChange: (value: number) => void;
  Icon: typeof Brain;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm text-slate-700">
          <Icon className="h-4 w-4 text-slate-500" />
          {label}
        </span>
        <span className="font-mono text-xl text-sky-700">{value}/10</span>
      </span>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-600"
      />
      <span className="mt-2 flex justify-between font-mono text-[10px] uppercase text-slate-500">
        <span>{low}</span>
        <span>{high}</span>
      </span>
    </label>
  );
}

function ScanResult({ label, value }: { label: string; value: string }) {
  return (
    <div className="telemetry-inset p-4 text-left">
      <p className="font-mono text-xl text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
