export type TriageLevel = "nominal" | "caution" | "critical";
export type ProtocolId = "breathing" | "light" | "sensory";
export type SignalKey = "neuroStress" | "circadianSleep" | "cognitiveVigilance" | "moodValence";

export type MissionEnvironment =
  | "Spacecraft Transit"
  | "Space Station"
  | "Lunar Rover"
  | "Planetary Base";

export type MissionContext = {
  missionName: string;
  missionDay: number;
  environment: MissionEnvironment;
  communicationDelayMin: number;
};

export type TelemetryReading = {
  sol: number;
  moodValence: number;
  affectStability: number;
  isolationStress: number;
  neuroStressMs: number;
  sleepHours: number;
  sleepDebtHours: number;
  circadianAlignment: number;
  fatigueScore: number;
  reactionScoreMs: number;
  cognitiveVigilance: number;
  voiceStressPct: number;
  facialStressPct: number;
};

export type CrewRoutineState = {
  date: string;
  streak: number;
  completedProtocols: ProtocolId[];
  dailyProtocolTarget: number;
};

export type DriftMetric = {
  baseline: number;
  deltaPct: number;
  label: string;
  status: TriageLevel;
};

export type SignalDrift = Record<SignalKey, DriftMetric> & {
  overall: TriageLevel;
};

export type CheckInPayload = {
  moodValence: number;
  isolationStress: number;
  voiceStressPct: number;
  reactionMs: number;
};

export type StateSnapshot = {
  reading: TelemetryReading;
  routine: CrewRoutineState;
  mindsetScore: number;
};

const TELEMETRY_KEY = "stellar-pulse.behavioral-telemetry.v3";
const CONTEXT_KEY = "stellar-pulse.context.v1";
const ROUTINE_KEY = "stellar-pulse.behavioral-routine.v3";

export const DEFAULT_CONTEXT: MissionContext = {
  missionName: "Ares Pathfinder",
  missionDay: 184,
  environment: "Spacecraft Transit",
  communicationDelayMin: 12,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const round = (value: number, precision = 0) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const SEED: Array<Omit<TelemetryReading, "sol">> = [
  [7.8, 84, 2.2, 46, 7.2, 0.5, 90, 2, 250, 98, 18, 16],
  [7.5, 82, 2.5, 44, 7, 0.8, 87, 3, 258, 97, 20, 18],
  [7.2, 80, 3, 43, 6.8, 1, 85, 3, 266, 95, 22, 21],
  [7.4, 82, 2.7, 45, 7, 0.8, 86, 3, 260, 96, 20, 19],
  [7, 78, 3.4, 41, 6.7, 1.3, 82, 4, 278, 93, 27, 24],
  [6.8, 76, 4, 39, 6.4, 1.7, 79, 4, 290, 90, 31, 28],
  [6.6, 74, 4.5, 38, 6.3, 1.9, 78, 5, 296, 88, 34, 30],
  [6.5, 73, 4.8, 37, 6.2, 2, 77, 5, 302, 86, 36, 32],
  [6.3, 71, 5.1, 36, 6, 2.2, 75, 5, 310, 84, 39, 35],
  [6.1, 69, 5.5, 35, 5.9, 2.4, 73, 6, 322, 82, 42, 38],
  [5.9, 67, 5.8, 34, 5.8, 2.5, 72, 6, 330, 80, 44, 40],
  [5.8, 66, 6, 33, 5.7, 2.6, 71, 6, 336, 79, 45, 41],
  [5.6, 64, 6.2, 32, 5.6, 2.7, 70, 6, 342, 78, 46, 42],
  [5.4, 62, 6.4, 31, 5.6, 2.8, 69, 6, 348, 77, 47, 43],
].map(
  ([
    moodValence,
    affectStability,
    isolationStress,
    neuroStressMs,
    sleepHours,
    sleepDebtHours,
    circadianAlignment,
    fatigueScore,
    reactionScoreMs,
    cognitiveVigilance,
    voiceStressPct,
    facialStressPct,
  ]) => ({
    moodValence,
    affectStability,
    isolationStress,
    neuroStressMs,
    sleepHours,
    sleepDebtHours,
    circadianAlignment,
    fatigueScore,
    reactionScoreMs,
    cognitiveVigilance,
    voiceStressPct,
    facialStressPct,
  }),
);

function baselineRoutine(): CrewRoutineState {
  return {
    date: new Date().toISOString().slice(0, 10),
    streak: 12,
    completedProtocols: [],
    dailyProtocolTarget: 1,
  };
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function statusRank(status: TriageLevel) {
  return status === "critical" ? 2 : status === "caution" ? 1 : 0;
}

function driftStatus(deltaPct: number): TriageLevel {
  if (deltaPct <= -20) return "critical";
  if (deltaPct <= -10) return "caution";
  return "nominal";
}

function formatDelta(deltaPct: number) {
  const sign = deltaPct > 0 ? "+" : "";
  return `${sign}${Math.round(deltaPct)}% / 7 Sol`;
}

function average(values: number[]) {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getSeedTelemetry(missionDay = DEFAULT_CONTEXT.missionDay): TelemetryReading[] {
  return SEED.map((reading, index) => ({
    sol: missionDay - SEED.length + index + 1,
    ...reading,
  }));
}

export function getMissionContext(): MissionContext {
  return safeRead(CONTEXT_KEY, DEFAULT_CONTEXT);
}

export function getTelemetry(): TelemetryReading[] {
  const stored = safeRead<TelemetryReading[]>(TELEMETRY_KEY, []);
  return Array.isArray(stored) && stored.length > 0
    ? stored
    : getSeedTelemetry(getMissionContext().missionDay);
}

export function getLatestTelemetry(): TelemetryReading {
  const values = getTelemetry();
  return values[values.length - 1] ?? getSeedTelemetry()[SEED.length - 1];
}

export function saveTelemetry(reading: TelemetryReading) {
  if (typeof window === "undefined") return;
  const next = [...getTelemetry().filter((item) => item.sol !== reading.sol), reading]
    .sort((a, b) => a.sol - b.sol)
    .slice(-60);
  window.localStorage.setItem(TELEMETRY_KEY, JSON.stringify(next));
}

export function getCrewRoutine(): CrewRoutineState {
  const fallback = baselineRoutine();
  const stored = safeRead<CrewRoutineState>(ROUTINE_KEY, fallback);
  if (stored.date !== fallback.date) return fallback;
  return {
    ...fallback,
    ...stored,
    completedProtocols: Array.isArray(stored.completedProtocols) ? stored.completedProtocols : [],
  };
}

export function saveCrewRoutine(state: CrewRoutineState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROUTINE_KEY, JSON.stringify(state));
}

export function calculateMindsetScore(
  reading: TelemetryReading,
  routine: CrewRoutineState,
): number {
  const hrv = clamp(reading.neuroStressMs / 50, 0, 1) * 100;
  const sleep = clamp(reading.sleepHours / 7.5, 0, 1) * 100;
  const vigilance = clamp(reading.cognitiveVigilance, 0, 100);
  const mood = clamp(reading.moodValence / 10, 0, 1) * 100;
  const targetMet = routine.completedProtocols.length >= routine.dailyProtocolTarget;
  return Math.round(
    clamp(hrv * 0.35 + sleep * 0.25 + vigilance * 0.25 + mood * 0.15 + (targetMet ? 2 : 0), 0, 100),
  );
}

export function reactionMsToVigilance(reactionMs: number): number {
  if (reactionMs <= 250) return 98;
  if (reactionMs >= 450) return 65;
  return Math.round(98 - ((reactionMs - 250) / 200) * 33);
}

export function evaluateSignalDrift(
  reading: TelemetryReading,
  history: TelemetryReading[],
): SignalDrift {
  const baselineReadings = history
    .filter((item) => item.sol < reading.sol)
    .sort((a, b) => a.sol - b.sol)
    .slice(-7);
  const source = baselineReadings.length > 0 ? baselineReadings : [reading];

  const createMetric = (current: number, values: number[]): DriftMetric => {
    const baseline = average(values);
    const deltaPct = baseline === 0 ? 0 : ((current - baseline) / baseline) * 100;
    return {
      baseline: round(baseline, 1),
      deltaPct: round(deltaPct, 1),
      label: formatDelta(deltaPct),
      status: driftStatus(deltaPct),
    };
  };

  const neuroStress = createMetric(
    reading.neuroStressMs,
    source.map((item) => item.neuroStressMs),
  );
  const circadianSleep = createMetric(
    reading.sleepHours,
    source.map((item) => item.sleepHours),
  );
  const cognitiveVigilance = createMetric(
    reading.cognitiveVigilance,
    source.map((item) => item.cognitiveVigilance),
  );
  const moodValence = createMetric(
    reading.moodValence,
    source.map((item) => item.moodValence),
  );
  const overall = [neuroStress, circadianSleep, cognitiveVigilance, moodValence]
    .map((metric) => metric.status)
    .sort((a, b) => statusRank(b) - statusRank(a))[0];

  return { neuroStress, circadianSleep, cognitiveVigilance, moodValence, overall };
}

export function recordCheckIn(payload: CheckInPayload): StateSnapshot {
  const current = getLatestTelemetry();
  const reactionMs = Math.round(clamp(payload.reactionMs, 100, 1000));
  const reading: TelemetryReading = {
    ...current,
    sol: getMissionContext().missionDay,
    moodValence: round(clamp(payload.moodValence, 1, 10), 1),
    affectStability: Math.round(clamp(100 - payload.voiceStressPct * 0.55, 0, 100)),
    isolationStress: round(clamp(payload.isolationStress, 0, 10), 1),
    voiceStressPct: Math.round(clamp(payload.voiceStressPct, 0, 100)),
    facialStressPct: Math.round(clamp(payload.voiceStressPct * 0.9, 0, 100)),
    reactionScoreMs: reactionMs,
    cognitiveVigilance: reactionMsToVigilance(reactionMs),
  };
  saveTelemetry(reading);
  const routine = getCrewRoutine();
  return { reading, routine, mindsetScore: calculateMindsetScore(reading, routine) };
}

export function applyProtocolImpact(protocolId: ProtocolId): StateSnapshot {
  const current = getLatestTelemetry();
  let reading = { ...current };
  if (protocolId === "breathing") {
    reading = {
      ...reading,
      neuroStressMs: round(clamp(reading.neuroStressMs + 6, 0, 80), 1),
      voiceStressPct: Math.round(clamp(reading.voiceStressPct - 8, 0, 100)),
    };
  } else if (protocolId === "light") {
    reading = {
      ...reading,
      sleepDebtHours: round(clamp(reading.sleepDebtHours - 0.5, 0, 12), 1),
      circadianAlignment: Math.round(clamp(reading.circadianAlignment + 8, 0, 100)),
    };
  } else {
    reading = {
      ...reading,
      moodValence: round(clamp(reading.moodValence + 1.5, 1, 10), 1),
      isolationStress: round(clamp(reading.isolationStress - 2, 0, 10), 1),
    };
  }
  saveTelemetry(reading);

  const currentRoutine = getCrewRoutine();
  const targetWasMet =
    currentRoutine.completedProtocols.length >= currentRoutine.dailyProtocolTarget;
  const completedProtocols = currentRoutine.completedProtocols.includes(protocolId)
    ? currentRoutine.completedProtocols
    : [...currentRoutine.completedProtocols, protocolId];
  const targetIsMet = completedProtocols.length >= currentRoutine.dailyProtocolTarget;
  const routine: CrewRoutineState = {
    ...currentRoutine,
    completedProtocols,
    streak: !targetWasMet && targetIsMet ? currentRoutine.streak + 1 : currentRoutine.streak,
  };
  saveCrewRoutine(routine);
  return { reading, routine, mindsetScore: calculateMindsetScore(reading, routine) };
}

export function getPriorityCountermeasure(reading: TelemetryReading): ProtocolId {
  const hrvDeficit = clamp((50 - reading.neuroStressMs) / 50, 0, 1);
  const lightDeficit = Math.max(
    clamp(reading.sleepDebtHours / 4, 0, 1),
    clamp((100 - reading.circadianAlignment) / 100, 0, 1),
  );
  const sensoryDeficit = Math.max(
    clamp((10 - reading.moodValence) / 10, 0, 1),
    clamp(reading.isolationStress / 10, 0, 1),
  );

  if (reading.sleepDebtHours > 1.5 && lightDeficit >= hrvDeficit) return "light";
  if (sensoryDeficit > hrvDeficit && sensoryDeficit > lightDeficit) return "sensory";
  return "breathing";
}

export function resetDemoData(): StateSnapshot {
  const readings = getSeedTelemetry(DEFAULT_CONTEXT.missionDay);
  const reading = readings[readings.length - 1];
  const routine = baselineRoutine();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TELEMETRY_KEY, JSON.stringify(readings));
    window.localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
    window.localStorage.setItem(CONTEXT_KEY, JSON.stringify(DEFAULT_CONTEXT));
  }
  return { reading, routine, mindsetScore: calculateMindsetScore(reading, routine) };
}

// Compatibility helpers for non-core routes.
export const getReadinessScore = calculateMindsetScore;

export function getOverallTriage(reading: TelemetryReading): TriageLevel {
  return evaluateSignalDrift(reading, getTelemetry()).overall;
}
