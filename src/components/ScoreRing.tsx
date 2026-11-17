// Circular score indicator, e.g. 7.2/10
export default function ScoreRing({
  score,
  max = 10,
  size = 120,
  label,
}: {
  score: number;
  max?: number;
  size?: number;
  label?: string;
}) {
  const stroke = Math.max(8, Math.round(size / 11));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(score / max, 1));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#3A3730" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#d29f22"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <span className="absolute font-display font-semibold text-textPrimary" style={{ fontSize: size / 4.5 }}>
        {label ?? `${score}/${max}`}
      </span>
    </div>
  );
}
