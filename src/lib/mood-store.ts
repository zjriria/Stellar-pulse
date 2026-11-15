export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type MoodEntry = {
  date: string;
  level: MoodLevel;
};

const KEY = "stellar-pulse.mood.v1";
const MAX = 60;

export const MOOD_EMOJI: Record<MoodLevel, string> = {
  1: "😢",
  2: "😟",
  3: "😐",
  4: "🙂",
  5: "😄",
};

export const MOOD_LABEL: Record<MoodLevel, string> = {
  1: "Very hard",
  2: "Uncomfortable",
  3: "Normal",
  4: "Good",
  5: "Bright",
};

export function getMoodLog(): MoodEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value: unknown): value is MoodEntry => {
      if (!value || typeof value !== "object") return false;
      const entry = value as { date?: unknown; level?: unknown };
      return (
        typeof entry.date === "string" &&
        typeof entry.level === "number" &&
        entry.level >= 1 &&
        entry.level <= 5
      );
    });
  } catch {
    return [];
  }
}

export function saveMood(level: MoodLevel) {
  if (typeof window === "undefined") return;
  const entry: MoodEntry = { date: new Date().toISOString(), level };
  const next = [entry, ...getMoodLog()].slice(0, MAX);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
