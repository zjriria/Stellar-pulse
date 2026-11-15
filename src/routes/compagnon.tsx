import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/compagnon")({
  head: () => ({
    meta: [
      { title: "Companion — Stellar Pulse" },
      {
        name: "description",
        content: "A gentle companion that accompanies you when the wave hits.",
      },
    ],
  }),
  component: CompagnonScreen,
});

type Bubble = { id: number; text: string };

const OPENING: string[] = [
  "I am here with you.",
  "This craving will pass.",
  "Breathe slowly. You've endured before, you can do it now.",
];

const REPLIES: Record<string, string[]> = {
  peur: ["It's normal to be afraid.", "You are safe now."],
  forte: ["This craving is just a wave.", "It rises, it falls. We'll get through it together."],
  mieux: ["This is already a victory.", "Let's ground it with breathing."],
};

function CompagnonScreen() {
  const navigate = useNavigate();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= OPENING.length) return;
    const t = setTimeout(
      () => {
        setBubbles((b) => [...b, { id: Date.now() + step, text: OPENING[step] }]);
        setStep((s) => s + 1);
      },
      step === 0 ? 300 : 1200,
    );
    return () => clearTimeout(t);
  }, [step]);

  const reply = (key: keyof typeof REPLIES) => {
    REPLIES[key].forEach((text, i) => {
      setTimeout(() => {
        setBubbles((b) => [...b, { id: Date.now() + i, text }]);
      }, i * 900);
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-8 pt-6">
      <header className="flex items-center">
        <Link
          to="/"
          aria-label="Back to home"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-foreground"
        >
          ←
        </Link>
        <h1 className="mr-3 text-base font-medium text-muted-foreground">Companion</h1>
      </header>

      <section aria-live="polite" className="mt-6 flex flex-1 flex-col gap-3 overflow-y-auto">
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="animate-bubble-in max-w-[85%] self-start rounded-2xl rounded-br-md bg-surface px-4 py-3 text-base leading-snug"
          >
            {b.text}
          </div>
        ))}
      </section>

      <section aria-label="Quick replies" className="mt-6 grid grid-cols-1 gap-2">
        <button
          onClick={() => reply("peur")}
          className="min-h-[56px] rounded-2xl border border-border bg-surface px-4 text-right text-sm"
        >
          I feel anxious
        </button>
        <button
          onClick={() => reply("forte")}
          className="min-h-[56px] rounded-2xl border border-border bg-surface px-4 text-right text-sm"
        >
          The craving is very strong
        </button>
        <button
          onClick={() => reply("mieux")}
          className="min-h-[56px] rounded-2xl border border-border bg-surface px-4 text-right text-sm"
        >
          I'm starting to feel better
        </button>
      </section>

      <button
        onClick={() => navigate({ to: "/respiration" })}
        className="mt-6 min-h-[64px] w-full rounded-2xl bg-ocean text-base font-semibold text-ocean-foreground transition active:scale-[0.98]"
      >
        Do a breathing exercise
      </button>
    </main>
  );
}
