// Stellar Pulse — local-only store. Two dimensions: anxiety + craving.
export type Kind = "anxiety" | "craving";

export type CravingEvent = {
  date: string; // ISO
  kind: Kind;
  scoreAvant: number;
  scoreApres: number;
};

export type ScorePoint = {
  date: string; // ISO
  kind: Kind;
  score: number;
};

const KEY = "stellar-pulse.events.v1";
const PENDING_KEY = "stellar-pulse.pending.v2";
const POINTS_KEY = "stellar-pulse.points.v2";
const MAX_POINTS = 200;

function isKind(v: unknown): v is Kind {
  return v === "anxiety" || v === "craving";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function getEvents(): CravingEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((value: unknown) => {
        const event = asRecord(value);
        return {
          date: String(event.date),
          kind: isKind(event.kind) ? event.kind : ("craving" as Kind),
          scoreAvant: Number(event.scoreAvant) || 0,
          scoreApres: Number(event.scoreApres) || 0,
        };
      })
      .slice(0, 14);
  } catch {
    return [];
  }
}

export function saveEvent(evt: CravingEvent) {
  if (typeof window === "undefined") return;
  const next = [evt, ...getEvents()].slice(0, 14);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

// --- Pending scores (saved before SOS, read after) ---
type Pending = { anxiety: number | null; craving: number | null };

export function setPendingScores(p: Partial<Pending>) {
  if (typeof window === "undefined") return;
  const current = getPendingScores();
  const next: Pending = {
    anxiety: p.anxiety ?? current.anxiety,
    craving: p.craving ?? current.craving,
  };
  window.localStorage.setItem(PENDING_KEY, JSON.stringify(next));
}

export function getPendingScores(): Pending {
  if (typeof window === "undefined") return { anxiety: null, craving: null };
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return { anxiety: null, craving: null };
    const p = JSON.parse(raw);
    return {
      anxiety: typeof p.anxiety === "number" ? p.anxiety : null,
      craving: typeof p.craving === "number" ? p.craving : null,
    };
  } catch {
    return { anxiety: null, craving: null };
  }
}

export function clearPendingScores() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PENDING_KEY);
}

// --- Journal de chaque variation ---
export function getScorePoints(kind?: Kind): ScorePoint[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(POINTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const all: ScorePoint[] = parsed.flatMap((value: unknown) => {
      const point = asRecord(value);
      if (!isKind(point.kind) || typeof point.score !== "number") return [];
      return [{ date: String(point.date), kind: point.kind, score: point.score }];
    });
    return kind ? all.filter((p) => p.kind === kind) : all;
  } catch {
    return [];
  }
}

export function saveScorePoint(kind: Kind, score: number) {
  if (typeof window === "undefined") return;
  const next = [...getScorePoints(), { date: new Date().toISOString(), kind, score }].slice(
    -MAX_POINTS,
  );
  window.localStorage.setItem(POINTS_KEY, JSON.stringify(next));
}
