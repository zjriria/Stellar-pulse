export type Victory = { date: string; text: string };

const KEY = "stellar-pulse.victories.v1";
const MAX = 50;

export function getVictories(): Victory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value: unknown): value is Victory => {
      if (!value || typeof value !== "object") return false;
      const victory = value as { date?: unknown; text?: unknown };
      return typeof victory.date === "string" && typeof victory.text === "string";
    });
  } catch {
    return [];
  }
}

export function saveVictory(text: string) {
  if (typeof window === "undefined") return;
  const next = [{ date: new Date().toISOString(), text }, ...getVictories()].slice(0, MAX);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
