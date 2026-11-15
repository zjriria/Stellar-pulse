import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, CheckCircle2 } from "lucide-react";
import { saveVictory } from "@/lib/victories-store";

const STEPS: { count: number; sense: string; verb: string; hint: string }[] = [
  { count: 5, sense: "see", verb: "Look for", hint: "things you can see around you." },
  { count: 4, sense: "touch", verb: "Touch", hint: "surfaces, textures, warmth or cold." },
  { count: 3, sense: "hear", verb: "Listen to", hint: "sounds near or far." },
  { count: 2, sense: "smell", verb: "Smell", hint: "scents, memories of a smell." },
  { count: 1, sense: "taste", verb: "Taste", hint: "the taste currently in your mouth." },
];

export function GroundingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);

  const data = STEPS[step];

  useEffect(() => {
    setChecked(Array(data?.count ?? 0).fill(false));
  }, [step, data?.count]);

  useEffect(() => {
    if (!data || checked.length === 0) return;
    if (checked.every(Boolean)) {
      const t = setTimeout(() => {
        if (step < STEPS.length - 1) setStep((s) => s + 1);
        else setDone(true);
      }, 450);
      return () => clearTimeout(t);
    }
  }, [checked, data, step]);

  const finish = () => {
    saveVictory("5-4-3-2-1 Grounding — I am back here");
    navigate({ to: "/resilience" });
  };

  if (done) {
    return (
      <div
        key="done"
        className="glass animate-scale-in mx-auto flex w-full max-w-md flex-col items-center rounded-[32px] p-8 text-center"
      >
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sage/20 text-sage">
          <CheckCircle2 className="h-10 w-10" />
        </span>
        <h2 className="mt-5 text-2xl font-bold">You are back here, now.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Well done. Breath is calm, and senses are present.
        </p>
        <button
          onClick={finish}
          className="mt-7 w-full rounded-full bg-ocean px-6 py-3.5 text-sm font-semibold text-ocean-foreground transition active:scale-[0.98]"
        >
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div key={step} className="glass animate-bubble-in mx-auto w-full max-w-md rounded-[32px] p-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Step {step + 1} / {STEPS.length}
        </p>
        <span className="text-3xl font-bold text-ocean tabular-nums">{data.count}</span>
      </div>
      <h2 className="mt-2 text-2xl font-bold leading-tight">
        {data.verb} <span className="text-ocean">{data.count}</span> things you can {data.sense}.
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{data.hint}</p>

      <ul className="mt-5 space-y-2">
        {checked.map((v, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => setChecked((arr) => arr.map((x, j) => (j === i ? !x : x)))}
              className={`flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-4 text-right text-sm transition active:scale-[0.98] ${
                v
                  ? "bg-ocean/15 ring-1 ring-ocean/40 animate-scale-in"
                  : "bg-foreground/5 hover:bg-foreground/10"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                  v ? "bg-ocean text-ocean-foreground" : "bg-foreground/10"
                }`}
              >
                {v && <Check className="h-4 w-4" />}
              </span>
              <span className={v ? "text-foreground" : "text-muted-foreground"}>
                {v ? "Logged" : `Item ${i + 1}`}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-center text-[11px] text-muted-foreground">
        Check when found. The next step will come automatically.
      </p>
    </div>
  );
}
