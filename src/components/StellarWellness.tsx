import {
  Activity,
  ArrowRight,
  Check,
  Heart,
  Home,
  Mic,
  Orbit,
  Pause,
  Play,
  Sparkles,
  Trophy,
  Volume2,
  Waves,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

type Tab = "state" | "challenges" | "now" | "exercises" | "vent";
type Exercise = "breathing" | "release" | "earth" | "sunset";

const moods = [
  { emoji: "😄", label: "Great" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😟", label: "Drained" },
  { emoji: "😢", label: "Struggling" },
] as const;

const exercises = [
  {
    id: "breathing" as const,
    title: "Cosmic Box Breathing",
    detail: "2 min · Calm your nervous system",
    color: "bg-[#E3F3FD]",
    icon: Waves,
  },
  {
    id: "release" as const,
    title: "Zero-G Muscle Release",
    detail: "3 min · Neck, shoulders & jaw",
    color: "bg-[#E8F8F2]",
    icon: Activity,
  },
  {
    id: "earth" as const,
    title: "Earth Rain & Forest Escape",
    detail: "5 min · Sensory decompression",
    color: "bg-[#F0EBFF]",
    icon: Volume2,
  },
  {
    id: "sunset" as const,
    title: "Cabin Sunset Wind-Down",
    detail: "10 min · Prepare for sleep shift",
    color: "bg-[#FFF0E5]",
    icon: Orbit,
  },
];

const challenges = [
  "Complete 1 breathing exercise",
  "Log your mood 3 Sols in a row",
  "Take a 5-min Earth audio break",
] as const;

export function StellarWellness() {
  const [tab, setTab] = useState<Tab>("now");
  const [mood, setMood] = useState(1);
  const [anxiety, setAnxiety] = useState(3);
  const [stress, setStress] = useState(3);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false]);
  const [activeExercise, setActiveExercise] = useState<Exercise>("breathing");

  const completedCount = completed.filter(Boolean).length;
  const recommendation = useMemo(() => {
    if (stress > 6 || anxiety > 6) return "Cosmic Box Breathing";
    if (mood >= 3) return "Earth Rain & Forest Escape";
    if (stress >= 4) return "Zero-G Muscle Release";
    return "Cabin Sunset Wind-Down";
  }, [anxiety, mood, stress]);

  const openExercise = (exercise: Exercise = "breathing") => {
    setActiveExercise(exercise);
    setTab("exercises");
  };

  return (
    <main className="wellness-shell min-h-dvh bg-[#F4F9FD] text-slate-800">
      <div className="mx-auto w-full max-w-[520px] px-5 pb-32 pt-[max(16px,env(safe-area-inset-top))]">
        <TopBar count={12 + completedCount} />

        {tab === "now" && (
          <NowView
            mood={mood}
            anxiety={anxiety}
            stress={stress}
            recommendation={recommendation}
            onMood={setMood}
            onAnxiety={setAnxiety}
            onStress={setStress}
            onSummary={() => setSummaryOpen(true)}
            onExercise={() => openExercise("breathing")}
          />
        )}
        {tab === "exercises" && (
          <ExercisesView
            active={activeExercise}
            stress={stress}
            onSelect={setActiveExercise}
            onBreathingComplete={() => setStress((value) => Math.max(0, value - 2))}
          />
        )}
        {tab === "vent" && <VentView onExercise={() => openExercise("breathing")} />}
        {tab === "challenges" && (
          <ChallengesView
            completed={completed}
            onToggle={(index) =>
              setCompleted((current) =>
                current.map((value, itemIndex) => (itemIndex === index ? !value : value)),
              )
            }
          />
        )}
        {tab === "state" && <StateView mood={mood} anxiety={anxiety} stress={stress} />}
      </div>

      <WellnessNav tab={tab} onChange={setTab} />
      {summaryOpen && <SummaryModal onClose={() => setSummaryOpen(false)} />}
    </main>
  );
}

function TopBar({ count }: { count: number }) {
  return (
    <header className="grid grid-cols-3 items-center">
      <div className="flex w-fit items-center gap-2 rounded-full bg-[#FFE8F0] px-3 py-2 text-xs font-semibold text-slate-700">
        <Trophy className="h-4 w-4 text-[#00A8E8]" />
        {count}
      </div>
      <div className="flex flex-col items-center">
        <div className="relative grid h-9 w-9 place-items-center rounded-full bg-white text-[#00A8E8] shadow-sm">
          <Orbit className="h-5 w-5" />
          <span className="absolute -right-1 top-0 h-2 w-2 rounded-full bg-[#FF9BB8]" />
        </div>
        <p className="mt-1 whitespace-nowrap text-[9px] font-bold tracking-[0.25em] text-slate-600">
          STELLAR PULSE
        </p>
      </div>
      <div />
    </header>
  );
}

function PageIntro({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="pb-6 pt-9 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#00A8E8]">{eyebrow}</p>
      <h1 className="mt-2 text-[34px] font-bold leading-[1.05] tracking-[-0.04em] text-slate-800">
        {title}
      </h1>
    </div>
  );
}

function NowView({
  mood,
  anxiety,
  stress,
  recommendation,
  onMood,
  onAnxiety,
  onStress,
  onSummary,
  onExercise,
}: {
  mood: number;
  anxiety: number;
  stress: number;
  recommendation: string;
  onMood: (value: number) => void;
  onAnxiety: (value: number) => void;
  onStress: (value: number) => void;
  onSummary: () => void;
  onExercise: () => void;
}) {
  return (
    <>
      <div className="pb-7 pt-10 text-center">
        <h1 className="text-[42px] font-bold leading-[0.98] tracking-[-0.055em] text-slate-800">
          You are here.
          <span className="mt-1 block text-[#00A8E8]">Breathe.</span>
        </h1>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={onSummary}
          className="soft-card flex w-full items-center justify-between bg-[#FDECF2] p-6 text-left transition hover:-translate-y-0.5"
        >
          <div className="min-w-0 pr-4">
            <span className="text-[10px] font-extrabold tracking-[0.16em] text-[#00A8E8]">NEW</span>
            <h2 className="mt-1 text-lg font-bold leading-tight text-slate-800">
              Your 7-Sol summary is ready
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Tap to view your emotional &amp; sleep recovery.
            </p>
          </div>
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-[#00A8E8] shadow-sm">
            <Sparkles className="h-6 w-6" />
          </span>
        </button>

        <section className="soft-card bg-[#E3F3FD] p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[17px] font-bold text-slate-800">How are you feeling right now?</h2>
            <span className="text-xl" aria-hidden="true">
              🙂
            </span>
          </div>
          <div className="mt-5 flex justify-between gap-2">
            {moods.map((item, index) => (
              <button
                key={item.label}
                type="button"
                aria-label={item.label}
                aria-pressed={mood === index}
                onClick={() => onMood(index)}
                className={`grid h-[clamp(2.5rem,12vw,3rem)] w-[clamp(2.5rem,12vw,3rem)] place-items-center rounded-full bg-white text-[clamp(1.25rem,6vw,1.5rem)] shadow-sm transition duration-200 ${
                  mood === index
                    ? "scale-110 ring-2 ring-[#00A8E8] ring-offset-2 ring-offset-[#E3F3FD]"
                    : "hover:scale-105"
                }`}
              >
                {item.emoji}
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] text-slate-500">
            Recommended: <span className="font-semibold text-[#008CC4]">{recommendation}</span>
          </p>
        </section>

        <section className="soft-card bg-[#E8F8F2] p-6">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#12BFA7]" />
            <h2 className="text-[17px] font-bold text-slate-800">Your state right now</h2>
          </div>
          <StateSlider
            label="Isolation & Anxiety"
            value={anxiety}
            color="sky"
            low="Grounded"
            high="Overwhelmed"
            onChange={onAnxiety}
          />
          <div className="my-5 h-px bg-emerald-200/70" />
          <StateSlider
            label="Stress & Tension"
            value={stress}
            color="mint"
            low="Relaxed"
            high="High pressure"
            onChange={onStress}
          />
          {(anxiety > 6 || stress > 6) && (
            <button
              type="button"
              onClick={onExercise}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#00A8E8] px-4 py-3 text-xs font-bold text-white shadow-[0_10px_24px_rgba(0,168,232,0.24)]"
            >
              Feeling tense? Start a 2-min relaxation exercise
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </section>
      </div>
    </>
  );
}

function StateSlider({
  label,
  value,
  color,
  low,
  high,
  onChange,
}: {
  label: string;
  value: number;
  color: "sky" | "mint";
  low: string;
  high: string;
  onChange: (value: number) => void;
}) {
  const style = { "--range-progress": `${value * 10}%` } as CSSProperties;
  return (
    <div className="mt-5">
      <div className="flex items-end justify-between">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p
          className={`text-3xl font-bold ${color === "sky" ? "text-[#00A8E8]" : "text-[#12BFA7]"}`}
        >
          {value}
          <span className="ml-0.5 text-xs font-medium text-slate-400">/10</span>
        </p>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={style}
        className={`wellness-range mt-4 w-full ${color === "sky" ? "range-sky" : "range-mint"}`}
        aria-label={label}
      />
      <div className="mt-2 flex justify-between text-[11px] text-slate-500">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function ExercisesView({
  active,
  stress,
  onSelect,
  onBreathingComplete,
}: {
  active: Exercise;
  stress: number;
  onSelect: (exercise: Exercise) => void;
  onBreathingComplete: () => void;
}) {
  return (
    <>
      <PageIntro eyebrow="Zero-medication care" title="Relax in your orbit." />
      <div className="space-y-3">
        {exercises.map((exercise) => {
          const Icon = exercise.icon;
          return (
            <button
              key={exercise.id}
              type="button"
              onClick={() => onSelect(exercise.id)}
              className={`soft-card flex w-full items-center gap-4 p-5 text-left transition ${
                exercise.color
              } ${active === exercise.id ? "ring-2 ring-[#00A8E8] ring-offset-2" : ""}`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#00A8E8] shadow-sm">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-slate-800">{exercise.title}</span>
                <span className="mt-1 block text-xs text-slate-500">{exercise.detail}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          );
        })}
      </div>
      <ExerciseStudio active={active} stress={stress} onBreathingComplete={onBreathingComplete} />
    </>
  );
}

function ExerciseStudio({
  active,
  stress,
  onBreathingComplete,
}: {
  active: Exercise;
  stress: number;
  onBreathingComplete: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [releaseStep, setReleaseStep] = useState(0);
  const [sound, setSound] = useState("Rain");
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [glow, setGlow] = useState(45);

  useEffect(() => {
    if (!running || active !== "breathing") return;
    const timer = window.setInterval(() => {
      setSeconds((value) => {
        if (value >= 119) {
          window.clearInterval(timer);
          setRunning(false);
          onBreathingComplete();
          return 120;
        }
        return value + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active, onBreathingComplete, running]);

  const phase = ["Inhale", "Hold", "Exhale"][Math.floor((seconds % 12) / 4)];
  const releaseSteps = ["Soften your jaw", "Drop your shoulders", "Release your neck"];

  return (
    <section className="soft-card mt-4 overflow-hidden bg-white p-6 shadow-[0_18px_50px_rgba(45,91,115,0.08)]">
      {active === "breathing" && (
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00A8E8]">
            Cosmic Box Breathing
          </p>
          <div className={`breathing-orb mx-auto mt-6 ${running ? "is-breathing" : ""}`}>
            <span>{running ? phase : "Ready"}</span>
          </div>
          <p className="mt-5 text-sm text-slate-500">
            {seconds === 120
              ? `Complete · stress eased from ${stress + 2}/10`
              : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")} / 2:00`}
          </p>
          <button
            type="button"
            onClick={() => {
              if (seconds === 120) setSeconds(0);
              setRunning((value) => !value);
            }}
            className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-[#00A8E8] px-6 py-3 text-sm font-bold text-white"
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Pause" : seconds > 0 && seconds < 120 ? "Continue" : "Begin"}
          </button>
        </div>
      )}

      {active === "release" && (
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#12BFA7]">
            Zero-G Muscle Release
          </p>
          <div className="mx-auto mt-6 grid h-32 w-32 place-items-center rounded-full bg-[#E8F8F2]">
            <Activity className="h-10 w-10 text-[#12BFA7]" />
          </div>
          <p className="mt-5 text-xl font-bold">{releaseSteps[releaseStep]}</p>
          <p className="mt-2 text-sm text-slate-500">Tense gently for 5 seconds, then let go.</p>
          <button
            type="button"
            onClick={() => setReleaseStep((value) => (value + 1) % releaseSteps.length)}
            className="mt-5 rounded-full bg-[#12BFA7] px-6 py-3 text-sm font-bold text-white"
          >
            Next area
          </button>
        </div>
      )}

      {active === "earth" && (
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
            Earth Sensory Escape
          </p>
          <div className="my-7 flex h-16 items-center justify-center gap-1">
            {[30, 50, 75, 45, 90, 60, 35, 70, 45, 25].map((height, index) => (
              <span
                key={index}
                className={`w-1.5 rounded-full bg-violet-300 ${soundPlaying ? "sound-bar" : ""}`}
                style={{ height }}
              />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            {["Rain", "Ocean", "Forest"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSound(item)}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  sound === item ? "bg-violet-500 text-white" : "bg-violet-50 text-violet-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSoundPlaying((value) => !value)}
            className="mx-auto mt-5 flex items-center gap-2 rounded-full bg-violet-500 px-6 py-3 text-sm font-bold text-white"
          >
            {soundPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {soundPlaying ? "Pause soundscape" : `Play ${sound.toLowerCase()}`}
          </button>
        </div>
      )}

      {active === "sunset" && (
        <div
          className="rounded-[24px] p-6 text-center transition"
          style={{ background: `rgba(255, 181, 111, ${glow / 100})` }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
            Cabin Sunset
          </p>
          <div className="mx-auto mt-5 h-24 w-24 rounded-full bg-amber-300 shadow-[0_0_50px_rgba(251,191,36,0.8)]" />
          <p className="mt-5 text-lg font-bold text-amber-950">Let this Sol go.</p>
          <input
            aria-label="Cabin sunset glow"
            type="range"
            min="15"
            max="80"
            value={glow}
            onChange={(event) => setGlow(Number(event.target.value))}
            className="mt-5 w-full accent-amber-500"
          />
          <p className="mt-2 text-xs text-amber-800">Adjust cabin glow</p>
        </div>
      )}
    </section>
  );
}

function VentView({ onExercise }: { onExercise: () => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(15);
  const [reflection, setReflection] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setRecording(false);
          setReflection(true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  const beginRecording = () => {
    setSeconds(15);
    setReflection(false);
    setRecording(true);
  };

  return (
    <>
      <PageIntro eyebrow="Private crew decompression" title="Let it out." />
      <section className="soft-card bg-[#E3F3FD] p-7 text-center">
        <p className="text-sm leading-relaxed text-slate-600">
          Private to your device, never sent to Mission Control.
        </p>
        <button
          type="button"
          onClick={recording ? () => setRecording(false) : beginRecording}
          className={`mic-button mx-auto mt-7 grid h-24 w-24 place-items-center rounded-full bg-[#00A8E8] text-white ${
            recording ? "is-recording" : ""
          }`}
          aria-label={recording ? "Stop recording" : "Start voice vent"}
        >
          <Mic className="h-9 w-9" />
        </button>
        <p className="mt-4 text-sm font-semibold text-[#008CC4]">
          {recording ? `Listening · ${seconds}s` : "Hold space for a 15-second voice vent"}
        </p>
      </section>

      <section className="soft-card mt-4 bg-[#FDECF2] p-6">
        <label htmlFor="vent-text" className="text-sm font-bold text-slate-700">
          Or write what is weighing on you
        </label>
        <textarea
          id="vent-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="This stays here, with you..."
          className="mt-3 min-h-28 w-full resize-none rounded-2xl border-0 bg-white/80 p-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#00A8E8]"
        />
        <button
          type="button"
          disabled={!text.trim()}
          onClick={() => setReflection(true)}
          className="mt-3 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-[#008CC4] disabled:opacity-40"
        >
          Release this thought
        </button>
      </section>

      {reflection && (
        <section className="soft-card mt-4 bg-[#E8F8F2] p-6">
          <Heart className="h-6 w-6 text-[#12BFA7]" />
          <h2 className="mt-3 text-lg font-bold">That sounds like a lot to carry.</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            You do not need to solve it all right now. Let your body soften before the next step.
          </p>
          <button
            type="button"
            onClick={onExercise}
            className="mt-5 flex items-center gap-2 rounded-full bg-[#12BFA7] px-5 py-3 text-xs font-bold text-white"
          >
            Breathe with me
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      )}
    </>
  );
}

function ChallengesView({
  completed,
  onToggle,
}: {
  completed: boolean[];
  onToggle: (index: number) => void;
}) {
  return (
    <>
      <PageIntro eyebrow="Small actions, steady crew" title="Today’s missions." />
      <div className="space-y-3">
        {challenges.map((challenge, index) => (
          <button
            key={challenge}
            type="button"
            onClick={() => onToggle(index)}
            className={`soft-card flex w-full items-center gap-4 p-5 text-left ${
              ["bg-[#FDECF2]", "bg-[#E3F3FD]", "bg-[#E8F8F2]"][index]
            }`}
          >
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
                completed[index] ? "bg-[#00A8E8] text-white" : "bg-white text-slate-300"
              }`}
            >
              {completed[index] ? <Check className="h-5 w-5" /> : <Trophy className="h-5 w-5" />}
            </span>
            <span className="flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Micro-mission {index + 1}
              </span>
              <span
                className={`mt-1 block font-bold ${
                  completed[index] ? "text-slate-400 line-through" : "text-slate-800"
                }`}
              >
                {challenge}
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="soft-card mt-4 bg-white p-6 text-center shadow-[0_18px_50px_rgba(45,91,115,0.07)]">
        <p className="text-3xl font-bold text-[#00A8E8]">
          {completed.filter(Boolean).length}/{challenges.length}
        </p>
        <p className="mt-1 text-xs text-slate-500">completed this Sol</p>
      </div>
    </>
  );
}

function StateView({ mood, anxiety, stress }: { mood: number; anxiety: number; stress: number }) {
  const stressTrend = [6, 5, 5, 4, 4, 3, stress];
  const moodTrend = ["😟", "😐", "🙂", "🙂", "😄", "🙂", moods[mood].emoji];
  return (
    <>
      <PageIntro eyebrow="Your last 7 Sols" title="You’re finding balance." />
      <section className="soft-card bg-[#E3F3FD] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Current state</p>
            <p className="mt-1 text-xl font-bold text-slate-800">{moods[mood].label}</p>
          </div>
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-3xl">
            {moods[mood].emoji}
          </span>
        </div>
        <div className="mt-7 flex justify-between">
          {moodTrend.map((item, index) => (
            <div key={index} className="text-center">
              <span className="text-xl">{item}</span>
              <span className="mt-1 block text-[9px] text-slate-400">S{index + 1}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="soft-card mt-4 bg-[#E8F8F2] p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Stress trend</p>
            <p className="mt-1 text-xl font-bold">Easing steadily</p>
          </div>
          <p className="text-3xl font-bold text-[#12BFA7]">{stress}/10</p>
        </div>
        <div className="mt-7 flex h-28 items-end justify-between gap-2">
          {stressTrend.map((value, index) => (
            <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2">
              <div
                className="w-full rounded-full bg-[#63DCCB] transition-all"
                style={{ height: `${value * 10}%` }}
              />
              <span className="text-[9px] text-slate-400">S{index + 1}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="soft-card mt-4 flex items-center justify-between bg-[#FDECF2] p-6">
        <div>
          <p className="text-xs font-semibold text-slate-500">Isolation &amp; anxiety</p>
          <p className="mt-1 text-lg font-bold">{anxiety <= 4 ? "Grounded" : "Needs care"}</p>
        </div>
        <p className="text-3xl font-bold text-[#FF7DA6]">{anxiety}/10</p>
      </section>
    </>
  );
}

function WellnessNav({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  const items = [
    { id: "state" as const, label: "My State", icon: Activity },
    { id: "challenges" as const, label: "Challenges", icon: Trophy },
    { id: "now" as const, label: "Now", icon: Home, center: true },
    { id: "exercises" as const, label: "Exercises", icon: Sparkles },
    { id: "vent" as const, label: "Vent", icon: Mic },
  ];

  return (
    <nav
      aria-label="Wellness navigation"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[520px] rounded-t-[30px] bg-white px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_40px_rgba(54,91,112,0.12)]"
    >
      <div className="grid grid-cols-5 items-end">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex min-w-0 flex-col items-center gap-1 text-[9px] font-semibold transition ${
                item.center ? "-mt-7" : "py-2"
              } ${tab === item.id ? "text-[#00A8E8]" : "text-slate-400"}`}
            >
              <span
                className={`grid place-items-center rounded-full ${
                  item.center
                    ? "h-16 w-16 border-[5px] border-white bg-[#00A8E8] text-white shadow-[0_8px_25px_rgba(0,168,232,0.35)]"
                    : "h-7 w-7"
                }`}
              >
                <Icon className={item.center ? "h-6 w-6" : "h-5 w-5"} />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function SummaryModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/20 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-title"
    >
      <div className="w-full max-w-md rounded-[32px] bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[#FDECF2] text-[#00A8E8]">
            <Sparkles className="h-6 w-6" />
          </span>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500"
            aria-label="Close summary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[#00A8E8]">
          7-Sol recovery
        </p>
        <h2
          id="summary-title"
          className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-800"
        >
          You’re recovering well.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Your stress eased by 18%, sleep consistency improved, and you checked in on five of the
          last seven Sols.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            ["−18%", "Stress"],
            ["+42m", "Sleep"],
            ["5/7", "Check-ins"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-[#F4F9FD] p-3 text-center">
              <p className="font-bold text-[#00A8E8]">{value}</p>
              <p className="mt-1 text-[10px] text-slate-500">{label}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-[#00A8E8] py-3.5 text-sm font-bold text-white"
        >
          Keep going
        </button>
      </div>
    </div>
  );
}
