// components/RingProgress.js
export default function RingProgress({ value, max, size = 120, strokeWidth = 10, color = '#14b8a6', label, sublabel }) {
  const pct     = Math.min(value / Math.max(max, 1), 1);
  const r       = (size - strokeWidth) / 2;
  const circ    = 2 * Math.PI * r;
  const offset  = circ * (1 - pct);
  const cx = cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke="var(--border)" strokeWidth={strokeWidth} />
          {/* Progress */}
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="ring-progress transition-all duration-700"
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-lg leading-none" style={{ color: 'var(--text-primary)' }}>
            {Math.round(pct * 100)}%
          </span>
          {sublabel && (
            <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sublabel}</span>
          )}
        </div>
      </div>
      {label && <p className="text-sm font-medium text-center" style={{ color: 'var(--text-secondary)' }}>{label}</p>}
    </div>
  );
}
