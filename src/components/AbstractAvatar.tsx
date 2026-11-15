type Props = {
  seed: number;
  size?: number;
  className?: string;
};

const PALETTES = [
  ["var(--ocean)", "var(--sage)"],
  ["var(--sage)", "var(--ocean)"],
  ["var(--ocean)", "#c9a0dc"],
  ["#a8c0a0", "var(--ocean)"],
  ["var(--sage)", "#f0d78c"],
  ["#9b72cf", "var(--sage)"],
];

export function AbstractAvatar({ seed, size = 40, className = "" }: Props) {
  const palette = PALETTES[seed % PALETTES.length];
  const cx1 = 20 + ((seed * 7) % 30);
  const cy1 = 20 + ((seed * 13) % 30);
  const r1 = 28 + ((seed * 5) % 14);
  const cx2 = 60 + ((seed * 11) % 25);
  const cy2 = 55 + ((seed * 17) % 30);
  const r2 = 22 + ((seed * 9) % 14);
  const gid = `g-${seed}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`shrink-0 overflow-hidden rounded-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette[0]} stopOpacity="0.9" />
          <stop offset="100%" stopColor={palette[1]} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gid})`} />
      <circle cx={cx1} cy={cy1} r={r1} fill={palette[1]} fillOpacity="0.55" />
      <circle cx={cx2} cy={cy2} r={r2} fill={palette[0]} fillOpacity="0.55" />
    </svg>
  );
}
