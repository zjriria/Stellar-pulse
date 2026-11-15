export type TriggerEntry = { date: string; triggers: string[] };

const KEY = "stellar-pulse.triggers.v1";
const MAX = 50;

export function getTriggers(): TriggerEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value: unknown): value is TriggerEntry => {
      if (!value || typeof value !== "object") return false;
      const entry = value as { date?: unknown; triggers?: unknown };
      return typeof entry.date === "string" && Array.isArray(entry.triggers);
    });
  } catch {
    return [];
  }
}

export function saveTriggers(triggers: string[]) {
  if (typeof window === "undefined") return;
  const next = [{ date: new Date().toISOString(), triggers }, ...getTriggers()].slice(0, MAX);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function getLastTriggers(): TriggerEntry | null {
  return getTriggers()[0] ?? null;
}
