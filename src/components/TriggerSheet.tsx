import { useEffect, useState } from "react";
import { Activity, CloudRain, Moon, RotateCw, Wind, X, Zap, type LucideIcon } from "lucide-react";
import { saveTriggers } from "@/lib/triggers-store";

type Trigger = { id: string; label: string; icon: LucideIcon };

const TRIGGERS: Trigger[] = [
  { id: "pain", label: "Pain", icon: Activity },
  { id: "stress", label: "Stress", icon: Zap },
  { id: "anxiety", label: "Anxiety", icon: Wind },
  { id: "fatigue", label: "Fatigue", icon: Moon },
  { id: "habit", label: "Habit", icon: RotateCw },
  { id: "sadness", label: "Sadness", icon: CloudRain },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onContinue: (triggers: string[]) => void;
};

export function TriggerSheet({ open, onClose, onContinue }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (id: string) =>
    setSelected((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));

  const submit = () => {
    if (selected.length === 0) return;
    saveTriggers(selected);
    onContinue(selected);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="What are you feeling right now"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-foreground/30 backdrop-blur-md"
      />
      <div
        className="glass relative mx-4 mb-4 w-full max-w-md rounded-[32px] p-6 animate-scale-in"
        style={{ animationDuration: "0.3s" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Before you continue
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-tight">
              What are you feeling right now?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-foreground transition hover:bg-foreground/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">You can select multiple. No judgment.</p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TRIGGERS.map(({ id, label, icon: Icon }) => {
            const active = selected.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                aria-pressed={active}
                className={`flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-2xl p-3 text-sm transition active:scale-[0.97] ${
                  active
                    ? "bg-ocean/15 ring-1 ring-ocean/50 text-foreground"
                    : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
                }`}
              >
                <Icon className={`h-6 w-6 ${active ? "text-ocean" : ""}`} />
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={selected.length === 0}
          className="mt-6 min-h-[56px] w-full rounded-full bg-ocean text-base font-semibold text-ocean-foreground transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue{selected.length > 0 ? ` · ${selected.length} selected` : ""}
        </button>
      </div>
    </div>
  );
}
