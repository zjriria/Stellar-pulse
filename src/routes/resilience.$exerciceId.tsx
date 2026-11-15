import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AudioPlayer } from "@/components/AudioPlayer";
import { BoxBreathing } from "@/components/BoxBreathing";
import { UrgeSurfingTimer } from "@/components/UrgeSurfingTimer";
import { GroundingWizard } from "@/components/GroundingWizard";
import { getExercise, TAG_LABELS, type Exercise } from "@/lib/resilience-data";
import { getVictories, saveVictory, type Victory } from "@/lib/victories-store";
import { addCredits, creditsForExercise } from "@/lib/rewards-store";

export const Route = createFileRoute("/resilience/$exerciceId")({
  loader: ({ params }) => {
    const ex = getExercise(params.exerciceId);
    if (!ex) throw notFound();
    return ex;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.title ?? "Exercise"} — Stellar Pulse` }],
  }),
  notFoundComponent: () => (
    <main className="mx-auto max-w-md p-8 text-center">
      <p className="text-sm text-muted-foreground">Exercise not found.</p>
      <Link to="/resilience" className="mt-4 inline-block text-ocean">
        Back
      </Link>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md p-8 text-center">
      <p className="text-sm text-destructive">{error.message}</p>
    </main>
  ),
  component: ExerciseScreen,
});

function ExerciseScreen() {
  const navigate = useNavigate();
  const ex = Route.useLoaderData() as Exercise;
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const usesStepTimer =
    ex.id !== "journal-victoires" &&
    ex.id !== "body-scan" &&
    ex.tag !== "insomnie" &&
    ex.id !== "box-breathing" &&
    ex.id !== "urge-surfing-timer" &&
    ex.id !== "grounding-wizard";

  useEffect(() => {
    if (!usesStepTimer) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [usesStepTimer]);

  if (ex.id === "journal-victoires") return <VictoriesScreen ex={ex} />;
  if (ex.id === "body-scan" || ex.tag === "insomnie") return <BodyScanScreen ex={ex} />;
  if (ex.id === "box-breathing") return <InteractiveScreen ex={ex} kind="box" />;
  if (ex.id === "urge-surfing-timer") return <InteractiveScreen ex={ex} kind="urge" />;
  if (ex.id === "grounding-wizard") return <InteractiveScreen ex={ex} kind="grounding" />;

  const last = step >= ex.steps.length - 1;
  const mm = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, "0");
  const ss = (elapsed % 60).toString().padStart(2, "0");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-6">
      <header className="flex items-center">
        <Link
          to="/resilience"
          aria-label="Back to library"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface"
        >
          ←
        </Link>
        <div className="mr-3 flex-1">
          <p className="text-[10px] uppercase tracking-wide text-ocean">{TAG_LABELS[ex.tag]}</p>
          <h1 className="text-base font-medium">{ex.title}</h1>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {mm}:{ss}
        </span>
      </header>

      <div className="mt-6 h-1 w-full rounded-full bg-surface">
        <div
          className="h-1 rounded-full bg-ocean transition-all"
          style={{ width: `${((step + 1) / ex.steps.length) * 100}%` }}
        />
      </div>

      <section className="mt-12 flex flex-1 items-center justify-center">
        <p
          key={step}
          className="animate-bubble-in text-center text-2xl font-medium leading-relaxed text-foreground"
        >
          {ex.steps[step]}
        </p>
      </section>

      {!last ? (
        <button
          onClick={() => setStep((s) => s + 1)}
          className="min-h-[64px] w-full rounded-2xl bg-ocean text-base font-semibold text-ocean-foreground transition active:scale-[0.98]"
        >
          Next ({step + 1} / {ex.steps.length})
        </button>
      ) : (
        <button
          onClick={() => {
            const pts = creditsForExercise(ex.durationMin);
            addCredits(pts, ex.title);
            saveVictory(`Completed exercise : ${ex.title}`);
            toast.success(`+${pts} points 🏆`, {
              description: "You completed the exercise, congratulations!",
            });
            navigate({ to: "/resilience" });
          }}
          className="min-h-[64px] w-full rounded-2xl bg-sage text-base font-semibold text-sage-foreground transition active:scale-[0.98]"
        >
          Done
        </button>
      )}
    </main>
  );
}

function VictoriesScreen({ ex }: { ex: Exercise }) {
  const [text, setText] = useState("");
  const [list, setList] = useState<Victory[]>([]);

  useEffect(() => {
    setList(getVictories());
  }, []);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    saveVictory(t);
    setText("");
    setList(getVictories());
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-6">
      <header className="flex items-center">
        <Link
          to="/resilience"
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface"
        >
          ←
        </Link>
        <div className="mr-3 flex-1">
          <p className="text-[10px] uppercase tracking-wide text-sage">{TAG_LABELS[ex.tag]}</p>
          <h1 className="text-base font-medium">{ex.title}</h1>
        </div>
      </header>

      <p className="mt-6 text-sm text-muted-foreground">
        A craving passed without giving in, a phone call you didn't make, a night you endured :
        Record your victory, even if it's very small.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Today, I did…"
        rows={4}
        className="mt-4 w-full rounded-2xl bg-surface p-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage"
      />

      <button
        onClick={submit}
        disabled={!text.trim()}
        className="mt-3 min-h-[56px] w-full rounded-2xl bg-sage text-base font-semibold text-sage-foreground transition active:scale-[0.98] disabled:opacity-50"
      >
        Record victory
      </button>

      <section className="mt-8">
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
          Your latest victories
        </p>
        {list.length === 0 ? (
          <p className="rounded-2xl bg-surface p-4 text-sm text-muted-foreground">
            Nothing yet. Start when you're ready.
          </p>
        ) : (
          <ul className="space-y-2">
            {list.slice(0, 5).map((v, i) => (
              <li key={i} className="rounded-2xl bg-surface p-4 text-sm">
                <p className="text-[10px] uppercase tracking-wide text-sage">
                  {new Date(v.date).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
                <p className="mt-1">{v.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function BodyScanScreen({ ex }: { ex: Exercise }) {
  return (
    <main className="mesh-bg mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-6">
      <header className="flex items-center">
        <Link
          to="/resilience"
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface"
        >
          ←
        </Link>
        <div className="mr-3 flex-1">
          <p className="text-[10px] uppercase tracking-wide text-sage">{TAG_LABELS[ex.tag]}</p>
          <h1 className="text-base font-medium">{ex.title}</h1>
        </div>
      </header>

      <section className="mt-8">
        <AudioPlayer
          title={ex.title}
          subtitle={`Guided voice · ${ex.durationMin} minutes`}
          durationSec={ex.durationMin * 60}
        />
      </section>

      <section className="mt-8">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Steps</p>
        <ol className="mt-3 space-y-3">
          {ex.steps.map((s, i) => (
            <li key={i} className="glass flex gap-3 rounded-2xl p-4 text-sm leading-relaxed">
              <span className="text-ocean tabular-nums">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Let the voice guide you. You can close your eyes.
      </p>
    </main>
  );
}

function InteractiveScreen({ ex, kind }: { ex: Exercise; kind: "box" | "urge" | "grounding" }) {
  return (
    <main className="mesh-bg mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-6">
      <header className="flex items-center">
        <Link
          to="/resilience"
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface"
        >
          ←
        </Link>
        <div className="mr-3 flex-1">
          <p className="text-[10px] uppercase tracking-wide text-ocean">{TAG_LABELS[ex.tag]}</p>
          <h1 className="text-base font-medium">{ex.title}</h1>
        </div>
      </header>

      <section className="mt-10 flex flex-1 items-center justify-center">
        {kind === "box" && <BoxBreathing />}
        {kind === "urge" && <UrgeSurfingTimer />}
        {kind === "grounding" && <GroundingWizard />}
      </section>
    </main>
  );
}
