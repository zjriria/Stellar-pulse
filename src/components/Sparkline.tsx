type Props = {
  values: number[];
  max?: number;
  width?: number;
  height?: number;
};

export function Sparkline({ values, max = 10, width = 96, height = 28 }: Props) {
  if (values.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const n = values.length;
  const xStep = n > 1 ? width / (n - 1) : 0;
  const y = (v: number) => height - (Math.min(v, max) / max) * height;
  const path = values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i * xStep).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(" ");
  const last = values[values.length - 1];
  const alert = last > 7;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke={alert ? "var(--destructive)" : "var(--ocean)"}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={(n - 1) * xStep}
        cy={y(last)}
        r={2.5}
        fill={alert ? "var(--destructive)" : "var(--sage)"}
      />
    </svg>
  );
}
