export const ROUTINE_ITEMS = [
  "Turn off screens",
  "Dim light",
  "Tea / Mint",
  "Stretch gently",
  "Breathe 4-7-8",
] as const;

export type SleepEntry = {
  date: string; // ISO
  bedtime: string; // HH:MM
  wake: string; // HH:MM
  durationMin: number;
  quality: number; // 1-5
};

const ROUTINE_KEY = (d: string) => `stellar-pulse.sleep.routine.${d}`;
const LOG_KEY = "stellar-pulse.sleep.log.v1";
const MAX = 7;

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getRoutine(): boolean[] {
  if (typeof window === "undefined") return ROUTINE_ITEMS.map(() => false);
  try {
    const raw = window.localStorage.getItem(ROUTINE_KEY(todayKey()));
    if (!raw) return ROUTINE_ITEMS.map(() => false);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === ROUTINE_ITEMS.length) return parsed;
    return ROUTINE_ITEMS.map(() => false);
  } catch {
    return ROUTINE_ITEMS.map(() => false);
  }
}

export function saveRoutine(state: boolean[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROUTINE_KEY(todayKey()), JSON.stringify(state));
}

export function getSleepLog(): SleepEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addSleepEntry(entry: Omit<SleepEntry, "durationMin">) {
  if (typeof window === "undefined") return;
  const dur = computeDuration(entry.bedtime, entry.wake);
  const next = [{ ...entry, durationMin: dur }, ...getSleepLog()].slice(0, MAX);
  window.localStorage.setItem(LOG_KEY, JSON.stringify(next));
}

export function computeDuration(bedtime: string, wake: string): number {
  const [bh, bm] = bedtime.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  let mins = wh * 60 + wm - (bh * 60 + bm);
  if (mins <= 0) mins += 24 * 60;
  return mins;
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m.toString().padStart(2, "0")}`;
}
