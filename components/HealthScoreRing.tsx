interface Props {
  score: number;
  size?: number;
}

function scoreColor(score: number): string {
  if (score >= 90) return "#16a34a";
  if (score >= 75) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function scoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Healthy";
  if (score >= 60) return "Needs Water";
  if (score >= 40) return "Stressed";
  return "Critical";
}

export default function HealthScoreRing({ score, size = 120 }: Props) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={8}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      {/* Score label in center */}
      <div className="absolute" style={{ marginTop: -(size / 2 + 18) }}>
        <span className="text-3xl font-bold" style={{ color }}>
          {score}
        </span>
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        {scoreLabel(score)}
      </span>
    </div>
  );
}
