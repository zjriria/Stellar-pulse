import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Check, X, Gift } from "lucide-react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import {
  REWARDS_CATALOG,
  getState,
  spendCredits,
  type Reward,
  type RewardsState,
  type Redemption,
} from "@/lib/rewards-store";

export const Route = createFileRoute("/recompenses")({
  head: () => ({
    meta: [
      { title: "Rewards — Stellar Pulse" },
      {
        name: "description",
        content: "Redeem your points for swimming, cinema, or sports sessions.",
      },
    ],
  }),
  component: RewardsScreen,
});

function RewardsScreen() {
  const [state, setState] = useState<RewardsState>({
    balance: 0,
    history: [],
    redemptions: [],
  });
  const [confirm, setConfirm] = useState<Reward | null>(null);
  const [showRedemption, setShowRedemption] = useState<Redemption | null>(null);

  useEffect(() => {
    setState(getState());
    const refresh = () => setState(getState());
    window.addEventListener("stellar-pulse:rewards-updated", refresh);
    return () => window.removeEventListener("stellar-pulse:rewards-updated", refresh);
  }, []);

  const confirmSpend = () => {
    if (!confirm) return;
    const r = spendCredits(confirm);
    if (!r) {
      toast.error("Insufficient balance");
      setConfirm(null);
      return;
    }
    setConfirm(null);
    setShowRedemption(r);
    toast.success(`Congratulations! ${confirm.name} 🎉`);
  };

  return (
    <main className="mesh-bg mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-28 pt-10">
      <header>
        <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Rewards</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight">
          Every exercise = points.
        </h1>
      </header>

      <section className="glass mt-6 flex items-center justify-between rounded-[28px] p-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Your balance</p>
          <p className="mt-1 text-5xl font-extrabold text-ocean tabular-nums">{state.balance}</p>
          <p className="mt-1 text-xs text-muted-foreground">points</p>
        </div>
        <Trophy className="h-16 w-16 text-ocean/60" />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">Rewards</h2>
        <div className="grid grid-cols-2 gap-3">
          {REWARDS_CATALOG.map((r) => {
            const canAfford = state.balance >= r.cost;
            return (
              <div key={r.id} className="glass flex flex-col rounded-2xl p-4 text-right">
                <span className="text-4xl" aria-hidden="true">
                  {r.emoji}
                </span>
                <h3 className="mt-2 text-sm font-bold leading-tight">{r.name}</h3>
                <p className="mt-1 flex-1 text-[11px] text-muted-foreground">{r.description}</p>
                <p className="mt-2 text-xs font-semibold text-ocean">{r.cost} points</p>
                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => setConfirm(r)}
                  className="mt-2 min-h-[40px] rounded-full bg-ocean text-xs font-semibold text-ocean-foreground transition active:scale-[0.98] disabled:opacity-40"
                >
                  {canAfford ? "Redeem" : `Short by ${r.cost - state.balance}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {state.redemptions.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
            Redeemed rewards
          </h2>
          <ul className="space-y-2">
            {state.redemptions.map((r) => (
              <li key={r.id} className="glass flex items-center justify-between rounded-2xl p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{r.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold">{r.rewardName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(r.date).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRedemption(r)}
                  className="rounded-full bg-foreground/5 px-3 py-1.5 text-[11px] font-semibold"
                >
                  Show code
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {state.history.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">History</h2>
          <ul className="space-y-2">
            {state.history.slice(0, 8).map((h, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 text-sm"
              >
                <span className="truncate">{h.reason}</span>
                <span
                  className={`font-bold tabular-nums ${
                    h.type === "earn" ? "text-sage" : "text-ocean"
                  }`}
                >
                  {h.type === "earn" ? "+" : "−"}
                  {h.amount}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {state.balance === 0 && state.redemptions.length === 0 && (
        <p className="mt-8 rounded-2xl bg-surface p-4 text-center text-sm text-muted-foreground">
          <Gift className="mx-auto mb-2 h-5 w-5" />
          Complete an exercise in <span className="font-semibold">Resilience</span> to start earning
          points.
        </p>
      )}

      <BottomNav />

      {confirm && (
        <Modal onClose={() => setConfirm(null)} title="Confirm Redemption">
          <div className="text-center">
            <span className="text-6xl">{confirm.emoji}</span>
            <h3 className="mt-3 text-xl font-bold">{confirm.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This will deduct <span className="font-bold text-ocean">{confirm.cost}</span> points
              from your balance.
            </p>
            <button
              type="button"
              onClick={confirmSpend}
              className="mt-5 w-full rounded-full bg-ocean px-6 py-3.5 text-sm font-semibold text-ocean-foreground transition active:scale-[0.98]"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirm(null)}
              className="mt-2 w-full rounded-full bg-foreground/5 px-6 py-3 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {showRedemption && (
        <Modal onClose={() => setShowRedemption(null)} title="Your code">
          <div className="text-center">
            <span className="text-5xl">{showRedemption.emoji}</span>
            <h3 className="mt-2 text-lg font-bold">{showRedemption.rewardName}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Show it at the location to benefit.
            </p>
            <div className="mt-4 flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `STELLAR-PULSE:${showRedemption.code}`,
                )}`}
                alt={`QR ${showRedemption.code}`}
                className="rounded-2xl bg-white p-3"
                width={200}
                height={200}
              />
            </div>
            <p className="mt-3 text-2xl font-extrabold tracking-widest text-ocean">
              {showRedemption.code}
            </p>
            <button
              type="button"
              onClick={() => setShowRedemption(null)}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ocean px-6 py-3 text-sm font-semibold text-ocean-foreground"
            >
              <Check className="h-4 w-4" /> Done
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-md animate-fade-in"
      />
      <div className="glass relative mx-4 mb-4 w-full max-w-md rounded-[32px] p-6 animate-scale-in">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
