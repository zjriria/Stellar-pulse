import { getEvents, getScorePoints } from "./craving-store";

const LAST_SEEN_KEY = "stellar-pulse.weekly.lastSeen";

const ENCOURAGEMENTS = [
  "You're doing great work. Every day is a victory.",
  "Still standing, and that's huge. Be proud of yourself.",
  "Step by step. You're moving forward, even on hard days.",
  "Your courage is real. It's invisible, but it's there.",
];

export function getEncouragement(): string {
  const idx = new Date().getDay() % ENCOURAGEMENTS.length;
  return ENCOURAGEMENTS[idx];
}

export type WeekStats = {
  avgCraving: number;
  sosCount: number;
  cleanDays: number;
};

export function computeWeekStats(): WeekStats {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const cravings = getScorePoints("craving").filter((p) => new Date(p.date).getTime() >= weekAgo);
  const avgCraving =
    cravings.length === 0
      ? 0
      : Math.round((cravings.reduce((a, b) => a + b.score, 0) / cravings.length) * 10) / 10;

  const sosCount = getEvents().filter((e) => new Date(e.date).getTime() >= weekAgo).length;

  const byDay = new Map<string, number>();
  cravings.forEach((p) => {
    const day = p.date.slice(0, 10);
    byDay.set(day, Math.max(byDay.get(day) ?? 0, p.score));
  });
  const heavyDays = Array.from(byDay.values()).filter((s) => s >= 8).length;
  const cleanDays = Math.max(0, 7 - heavyDays);

  return { avgCraving, sosCount, cleanDays };
}

export function isWeeklyReviewReady(): boolean {
  return true;
}

export function markWeeklyReviewSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
}
