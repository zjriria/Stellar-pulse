import { Link } from "@tanstack/react-router";
import { Activity, Home, Orbit } from "lucide-react";

const TABS = [
  { to: "/", label: "Pulse", Icon: Home },
  { to: "/check-in", label: "Check-in", Icon: Activity },
  { to: "/protocols", label: "Protocols", Icon: Orbit },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Main Navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-2xl items-stretch justify-around px-1 py-2">
        {TABS.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            aria-label={label}
            activeOptions={{ exact: true }}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] text-slate-500 transition hover:text-slate-900 data-[status=active]:text-sky-700"
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
