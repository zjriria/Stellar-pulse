export type Reward = {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  description: string;
};

export type HistoryEntry = {
  type: "earn" | "spend";
  amount: number;
  reason: string;
  date: string;
};

export type Redemption = {
  id: string;
  rewardId: string;
  rewardName: string;
  emoji: string;
  code: string;
  date: string;
};

export type RewardsState = {
  balance: number;
  history: HistoryEntry[];
  redemptions: Redemption[];
};

const KEY = "stellar-pulse.rewards.v1";
export const CREDITS_PER_MINUTE = 5;

export const REWARDS_CATALOG: Reward[] = [
  {
    id: "swim",
    name: "Free swimming session",
    emoji: "🏊",
    cost: 200,
    description: "One session at a partner pool.",
  },
  {
    id: "cinema",
    name: "Cinema ticket",
    emoji: "🎬",
    cost: 150,
    description: "One ticket at a nearby cinema.",
  },
  {
    id: "gym",
    name: "Gym membership",
    emoji: "💪",
    cost: 500,
    description: "A full week at the gym.",
  },
  {
    id: "book",
    name: "Book or coffee",
    emoji: "📚",
    cost: 100,
    description: "Voucher for a bookstore or coffee shop.",
  },
];

function read(): RewardsState {
  if (typeof window === "undefined") return { balance: 0, history: [], redemptions: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { balance: 0, history: [], redemptions: [] };
    const parsed = JSON.parse(raw);
    return {
      balance: typeof parsed.balance === "number" ? parsed.balance : 0,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      redemptions: Array.isArray(parsed.redemptions) ? parsed.redemptions : [],
    };
  } catch {
    return { balance: 0, history: [], redemptions: [] };
  }
}

function write(state: RewardsState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("stellar-pulse:rewards-updated"));
}

export function getBalance(): number {
  return read().balance;
}

export function getState(): RewardsState {
  return read();
}

export function getHistory(): HistoryEntry[] {
  return read().history;
}

export function getRedemptions(): Redemption[] {
  return read().redemptions;
}

export function addCredits(amount: number, reason: string): number {
  if (amount <= 0) return getBalance();
  const s = read();
  s.balance += amount;
  s.history.unshift({
    type: "earn",
    amount,
    reason,
    date: new Date().toISOString(),
  });
  s.history = s.history.slice(0, 50);
  write(s);
  return s.balance;
}

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "BLD-";
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function spendCredits(reward: Reward): Redemption | null {
  const s = read();
  if (s.balance < reward.cost) return null;
  s.balance -= reward.cost;
  const redemption: Redemption = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    rewardId: reward.id,
    rewardName: reward.name,
    emoji: reward.emoji,
    code: randomCode(),
    date: new Date().toISOString(),
  };
  s.redemptions.unshift(redemption);
  s.history.unshift({
    type: "spend",
    amount: reward.cost,
    reason: reward.name,
    date: new Date().toISOString(),
  });
  s.history = s.history.slice(0, 50);
  write(s);
  return redemption;
}

export function creditsForExercise(durationMin: number): number {
  return Math.max(5, Math.round(durationMin * CREDITS_PER_MINUTE));
}
