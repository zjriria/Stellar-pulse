export type Tag =
  | "manque"
  | "panique"
  | "intrusives"
  | "apaiser"
  | "insomnie"
  | "deprime"
  | "hashish"
  | "karkoubi";

export const TAG_LABELS: Record<Tag, string> = {
  manque: "Craving",
  panique: "Severe Anxiety",
  intrusives: "Heavy Thoughts",
  apaiser: "Calmness",
  insomnie: "Sleep",
  deprime: "Sadness",
  hashish: "Cannabis",
  karkoubi: "Psychotropic Drugs",
};

export type Exercise = {
  id: string;
  title: string;
  tag: Tag;
  durationMin: number;
  steps: string[];
};

export const EXERCISES: Exercise[] = [
  {
    id: "urge-surfing",
    title: "Surfing the urge",
    tag: "manque",
    durationMin: 3,
    steps: [
      "The craving is rising. Just watch it, that's all.",
      "Where do you feel it in your body? Chest, stomach, throat?",
      "Imagine it like a wave: it rises… and it falls.",
      "You don't have to do anything with it, and you don't have to fight it.",
      "Stay on the beach. Every wave eventually recedes.",
    ],
  },
  {
    id: "5-4-3-2-1",
    title: "5-4-3-2-1 When everything feels overwhelming",
    tag: "panique",
    durationMin: 3,
    steps: [
      "Name 5 things you can see around you.",
      "Name 4 things you can touch.",
      "Name 3 things you can hear.",
      "Name 2 smells (or memories of a smell).",
      "Name 1 taste in your mouth right now.",
    ],
  },
  {
    id: "defusion",
    title: "It's just a thought, not you",
    tag: "intrusives",
    durationMin: 3,
    steps: [
      "Notice the thought that's attacking you.",
      "Add before it: «I am having the thought that…»",
      "Then: «I notice that I am having the thought that…»",
      "The thought is not you. It just passes through you.",
      "Let it be there, without following it.",
    ],
  },
  {
    id: "coherence",
    title: "Balanced breathing — Heart calmness",
    tag: "apaiser",
    durationMin: 3,
    steps: [
      "Sit up straight, shoulders relaxed.",
      "Breathe in gently through the nose for 5 seconds.",
      "Breathe out gently through the mouth for 5 seconds.",
      "Continue this rhythm, without forcing it.",
      "Feel your heart calm down, and your mind relax.",
    ],
  },
  {
    id: "lieu-sur",
    title: "A place of safety",
    tag: "apaiser",
    durationMin: 3,
    steps: [
      "Close your eyes. Imagine a place where you feel at ease.",
      "See the colors, the light.",
      "Hear the sounds of that place.",
      "Feel the warmth, the textures.",
      "Stay there a little while. You can return whenever you want.",
    ],
  },
  {
    id: "auto-compassion",
    title: "Be kind to yourself — You're doing great",
    tag: "intrusives",
    durationMin: 3,
    steps: [
      "Put your hand on your heart.",
      "Tell yourself: «This is a difficult moment.»",
      "Then: «A lot of people go through this.»",
      "Finally: «May I be kind to myself, right now.»",
      "Stay a minute in this warm tenderness.",
    ],
  },
  {
    id: "stop",
    title: "STOP before following the urge",
    tag: "manque",
    durationMin: 3,
    steps: [
      "S — Stop. Stop what you are doing.",
      "T — Take a deep breath.",
      "O — Observe the urge without judging it.",
      "P — Proceed with what really matters to you.",
      "If you find it for a few minutes. That's a huge win.",
    ],
  },
  {
    id: "carre",
    title: "Square breathing",
    tag: "panique",
    durationMin: 3,
    steps: [
      "Breathe in for 4 seconds.",
      "Hold your breath for 4 seconds.",
      "Breathe out for 4 seconds.",
      "Hold again for 4 seconds.",
      "Repeat the square, gently.",
    ],
  },
  {
    id: "urge-surfing-long",
    title: "Surfing the wave (long version)",
    tag: "manque",
    durationMin: 5,
    steps: [
      "Sit comfortably. The urge is there, don't fight it.",
      "See it as a wave. Where does it start in your body?",
      "Breathe gently. In for 4 seconds, out for 6 seconds.",
      "The wave is rising. This is normal. Just watch.",
      "It has reached the peak. You are still here, whole.",
      "Now it's starting to fall. Feel it.",
      "None of them lasts forever. Now you have passed one.",
    ],
  },
  {
    id: "ancrage-54321-flash",
    title: "5-4-3-2-1 Grounding (for tough moments)",
    tag: "panique",
    durationMin: 3,
    steps: [
      "You are here, right now. You are safe.",
      "Look around: explicitly name 5 things you see.",
      "Touch 4 different surfaces. Feel their texture.",
      "Listen: 3 different sounds in the environment.",
      "2 smells, real or imagined.",
      "1 taste in the mouth. You're back. It will pass.",
    ],
  },
  {
    id: "journal-victoires",
    title: "Victories Journal",
    tag: "apaiser",
    durationMin: 3,
    steps: ["Write down a time when you resisted.", "Even if it was small, it's a victory."],
  },
  {
    id: "body-scan",
    title: "Body scan",
    tag: "apaiser",
    durationMin: 5,
    steps: [
      "Sit comfortably, lying down or sitting.",
      "Close your eyes. Put your attention on your feet.",
      "Move up slowly: legs, knees, thighs, waist.",
      "Watch your stomach rise and fall with every breath.",
      "Relax your shoulders, neck, and jaw.",
      "Feel your entire body as one, alive and calm.",
    ],
  },
  {
    id: "scan-corporel-profond",
    title: "Deep body scan — to fall asleep",
    tag: "insomnie",
    durationMin: 8,
    steps: [
      "Lie down. Feel the weight of your body sinking.",
      "Put attention on your face. Relax your forehead and jaw.",
      "Lower your shoulders. Let them melt into the mattress.",
      "Arms, hands, fingers: let all tension out with your breath.",
      "Chest and stomach: follow the movement of your calm breath.",
      "Legs: feel them heavy, warm, calm.",
      "Your whole body is relaxed. You can drift into sleep.",
    ],
  },
  {
    id: "visualisation-endormir",
    title: "Visualization for sleep",
    tag: "insomnie",
    durationMin: 6,
    steps: [
      "Close your eyes. Imagine stairs going down slowly.",
      "With every step, it gets lighter.",
      "10… 9… 8… The light fades, silence comes.",
      "At the bottom, a beach at night. Warm sand under your feet.",
      "The waves breathe with you. In… out…",
      "You can stay here as long as sleep takes.",
    ],
  },
  {
    id: "petit-pas",
    title: "A small step, a small light",
    tag: "deprime",
    durationMin: 3,
    steps: [
      "Today doesn't have to be big. Just get through it.",
      "Choose a small thing: a glass of water, open a window.",
      "Do it, without waiting to feel motivated.",
      "Action brings motivation, not the other way around.",
      "Acknowledge this step. It really counts.",
    ],
  },
  {
    id: "box-breathing",
    title: "Box breathing 4·4·4·4",
    tag: "apaiser",
    durationMin: 4,
    steps: [
      "Breathe in gently for 4 seconds.",
      "Hold breath for 4 seconds, without pressure.",
      "Breathe out for 4 seconds, long.",
      "Wait 4 seconds, empty and calm.",
      "Repeat the box, at your pace.",
    ],
  },
  {
    id: "urge-surfing-timer",
    title: "Urge timer — 15 minutes",
    tag: "manque",
    durationMin: 15,
    steps: [
      "The urge is there. Don't fight it.",
      "Sit. Start the 15-minute timer.",
      "Breathe gently, watch the wave rise.",
      "None of them lasts forever.",
      "In the end, you have won.",
    ],
  },
  {
    id: "grounding-wizard",
    title: "Guided 5-4-3-2-1 grounding",
    tag: "panique",
    durationMin: 4,
    steps: [
      "You are here, right now. You are safe.",
      "We will go through 5 senses, one by one.",
      "Acknowledge when you find each thing.",
      "The next stage will come on its own.",
      "In the end, you will truly return.",
    ],
  },
  {
    id: "craving-zatla",
    title: "Cannabis craving — How to pass it",
    tag: "hashish",
    durationMin: 5,
    steps: [
      "The cannabis craving has arrived. It's a wave, not a command.",
      "Tell yourself: «It has nothing to do with me, it will pass in 15 minutes.»",
      "Breathe in for 4 seconds, out for 6. Repeat 5 times.",
      "Look at your hands. Do something else: drink a glass of cold water.",
      "Change places: leave the place where you used to smoke.",
      "Now you will feel the wave falling. Be patient.",
      "Every time you say «no», you strengthen yourself.",
    ],
  },
  {
    id: "stop-karkoubi",
    title: "Stop pills — Now",
    tag: "karkoubi",
    durationMin: 6,
    steps: [
      "Stop. Keep your hands away from the pills.",
      "Put your hand on your heart. Feel it beating.",
      "Say out loud: «This drug will bring me down, not save me.»",
      "Take 5 long, calm breaths.",
      "Call someone you trust, or go into the app.",
      "The physical feeling (shaking, lightness) is normal. It passes.",
      "Change location right now — go to the street, the mosque, a safe place.",
      "Now, record: «I didn't take it.» This is a big win.",
    ],
  },
  {
    id: "rechute-self-talk",
    title: "After a relapse — Without judging myself",
    tag: "deprime",
    durationMin: 4,
    steps: [
      "The relapse happened. This is not the end.",
      "Put your hand on your chest. Breathe 3 times.",
      "Tell yourself: «I reduced again, this is no shame.»",
      "The work I did before is not erased.",
      "How long can it go before you repeat? An hour? 30 minutes?",
      "Choose a small step for tomorrow: a glass of water, a short walk.",
      "The day starts with a single breath, and you are here now.",
    ],
  },
];

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}
