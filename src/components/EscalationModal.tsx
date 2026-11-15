import { useEffect } from "react";
import { HeartHandshake, Phone, Building2, Stethoscope, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function EscalationModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
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

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="We are with you"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-md animate-fade-in"
      />
      <div
        className="glass relative mx-4 mb-4 w-full max-w-md rounded-[32px] p-6 animate-scale-in"
        style={{ animationDuration: "0.4s" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 text-foreground transition hover:bg-foreground/10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ocean/15 text-ocean">
            <HeartHandshake className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold leading-tight">You are not alone.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            You are having a hard time today. There is no shame in asking for help. These people are
            ready to listen to you right now, completely confidentially.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <a
            href="tel:0801000180"
            className="glass flex min-h-[64px] w-full items-center gap-3 rounded-2xl px-4 text-right transition active:scale-[0.98]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ocean text-ocean-foreground">
              <Phone className="h-5 w-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-bold">📞 Sourire de Reda · 0801 000 180</span>
              <span className="text-xs text-muted-foreground">
                Listening line · Free · Anonymous
              </span>
            </span>
          </a>

          <a
            href="tel:0537803333"
            className="glass flex min-h-[64px] w-full items-center gap-3 rounded-2xl px-4 text-right transition active:scale-[0.98]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage text-sage-foreground">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-bold">🏥 Ar-Razi Hospital (Salé) — Addiction Ward</span>
              <span className="text-xs text-muted-foreground">
                Addiction Specialists · Hashish, Pills, and more
              </span>
            </span>
          </a>

          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="glass flex min-h-[64px] w-full items-center gap-3 rounded-2xl px-4 text-right transition active:scale-[0.98]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground">
              <Stethoscope className="h-5 w-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-bold">👨‍⚕️ Find a specialist near you</span>
              <span className="text-xs text-muted-foreground">Addiction center in your city</span>
            </span>
          </a>
        </div>

        <p className="mt-4 text-center text-[10px] text-muted-foreground">
          This app does not replace a doctor. If your life is in danger, call 141 (SAMU).
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full py-3 text-center text-xs text-muted-foreground transition hover:text-foreground"
        >
          I can manage, continue exercises.
        </button>
      </div>
    </div>
  );
}
