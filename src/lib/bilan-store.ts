export type BilanType = "gad7" | "craving" | "triggers" | "phq9";

export type TriggerKind = "stress" | "insomnie" | "entourage" | "autre";

export type BilanResult = {
  date: string;
  type: BilanType;
  score: number;
  max: number;
  label: string;
  trigger?: TriggerKind;
};

const KEY = "stellar-pulse.bilans.v1";
const TRIGGER_KEY = "stellar-pulse.trigger.v1";
const MAX = 20;

export const GAD7_OPTIONS = [
  { label: "Never", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

export const GAD7_QUESTIONS = [
  "Feeling nervous, anxious or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

export const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself, or that you are a failure",
  "Trouble concentrating on things (reading, TV, conversations)",
  "Moving or speaking slowly — or the opposite being very fidgety",
  "Thoughts that you would be better off dead, or of hurting yourself",
];

export function phq9Label(score: number): string {
  if (score <= 4) return "Balanced state";
  if (score <= 9) return "Mild sadness";
  if (score <= 14) return "Moderate sadness";
  if (score <= 19) return "Strong sadness — speak with a doctor";
  return "Severe sadness — speak with a doctor now";
}

export const CRAVING_OPTIONS = [
  { label: "Never", value: 0 },
  { label: "A little", value: 1 },
  { label: "Sometimes", value: 2 },
  { label: "A lot", value: 3 },
  { label: "All the time", value: 4 },
];

export const CRAVING_QUESTIONS = [
  "How many times did you think about weed or drugs today?",
  "How strong was the craving on average?",
  "How hard was it to control it?",
  "How much time did these thoughts steal from you?",
  "How much weakness did they cause you?",
];

export type TriggersQuestion =
  | { kind: "scale"; text: string; options: { label: string; value: number }[] }
  | {
      kind: "trigger";
      text: string;
      options: { label: string; value: TriggerKind }[];
    };

export const TRIGGERS_QUESTIONS: TriggersQuestion[] = [
  {
    kind: "scale",
    text: "How many times did you feel it very strongly this week?",
    options: [
      { label: "Never", value: 0 },
      { label: "1 or 2 times", value: 1 },
      { label: "Many times", value: 2 },
      { label: "Every day", value: 3 },
      { label: "Many times a day", value: 4 },
    ],
  },
  {
    kind: "trigger",
    text: "What was the biggest trigger?",
    options: [
      { label: "Stress", value: "stress" },
      { label: "Sleep issues", value: "insomnie" },
      { label: "Family / Friends", value: "entourage" },
      { label: "Other", value: "autre" },
    ],
  },
  {
    kind: "scale",
    text: "Did you feel physical withdrawal symptoms?",
    options: [
      { label: "None", value: 0 },
      { label: "Mild", value: 1 },
      { label: "Moderate", value: 2 },
      { label: "Strong", value: 3 },
      { label: "Very strong", value: 4 },
    ],
  },
  {
    kind: "scale",
    text: "How hard was it to resist?",
    options: [
      { label: "Easy", value: 0 },
      { label: "A bit hard", value: 1 },
      { label: "Hard", value: 2 },
      { label: "Very hard", value: 3 },
      { label: "Almost impossible", value: 4 },
    ],
  },
];

export const TRIGGERS_MAX = 12;

export function triggersLabel(score: number): string {
  if (score <= 3) return "Mild craving — you resisted well";
  if (score <= 7) return "Moderate craving — keep it up";
  return "High craving — speak with a doctor";
}

export function gad7Label(score: number): string {
  if (score <= 4) return "Minimal anxiety";
  if (score <= 9) return "Mild anxiety";
  if (score <= 14) return "Moderate anxiety";
  return "Severe anxiety — speak with a doctor";
}

export function cravingLabel(score: number): string {
  if (score <= 4) return "Weak craving";
  if (score <= 9) return "Mild craving";
  if (score <= 14) return "Moderate craving";
  return "High craving — speak with a doctor";
}

export function getBilans(): BilanResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value: unknown): value is BilanResult => {
      if (!value || typeof value !== "object") return false;
      const type = (value as { type?: unknown }).type;
      return type === "gad7" || type === "craving" || type === "triggers" || type === "phq9";
    });
  } catch {
    return [];
  }
}

export function saveBilan(r: BilanResult) {
  if (typeof window === "undefined") return;
  const next = [r, ...getBilans()].slice(0, MAX);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function setLastTrigger(t: TriggerKind) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TRIGGER_KEY, t);
}

export function getLastTrigger(): TriggerKind | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(TRIGGER_KEY);
  if (v === "stress" || v === "insomnie" || v === "entourage" || v === "autre") return v;
  return null;
}
