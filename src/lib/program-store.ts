import { getLastTrigger, type TriggerKind } from "./bilan-store";

export type Program = {
  week: number;
  title: string;
  recommendedIds: string[];
  trigger: TriggerKind | null;
  createdAt: string;
};

const KEY = "stellar-pulse.program.v1";

const MAPPING: Record<TriggerKind | "default", string[]> = {
  stress: ["coherence", "auto-compassion", "lieu-sur"],
  insomnie: ["coherence", "carre", "lieu-sur"],
  entourage: ["stop", "defusion", "journal-victoires"],
  autre: ["urge-surfing-long", "ancrage-54321-flash", "journal-victoires"],
  default: ["urge-surfing-long", "ancrage-54321-flash", "journal-victoires"],
};

const TITLES = [
  "Understand and anticipate",
  "Tame your waves",
  "Build your calm routine",
  "Deepen your patience",
];

export function getProgram(): Program | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Program;
  } catch {
    return null;
  }
}

export function generateProgram(): Program {
  const prev = getProgram();
  const trigger = getLastTrigger();
  const ids = MAPPING[trigger ?? "default"];
  const week = (prev?.week ?? 1) + (prev ? 1 : 0) || 2;
  const next: Program = {
    week,
    title: TITLES[(week - 2) % TITLES.length] ?? TITLES[0],
    recommendedIds: ids,
    trigger,
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearProgram() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
