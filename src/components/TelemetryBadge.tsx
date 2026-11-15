import type { TriageLevel } from "@/lib/mission-health-store";

const LABELS: Record<TriageLevel, string> = {
  nominal: "Nominal",
  caution: "Caution / drift",
  critical: "Flight surgeon alert",
};

export function TelemetryBadge({
  level,
  compact = false,
}: {
  level: TriageLevel;
  compact?: boolean;
}) {
  return (
    <span className={`telemetry-badge telemetry-${level}`} data-compact={compact || undefined}>
      <span className="telemetry-dot" aria-hidden="true" />
      {compact ? LABELS[level].split(" / ")[0] : LABELS[level]}
    </span>
  );
}
