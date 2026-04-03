// components/MacroBar.js
import { pct } from '../lib/utils';

export default function MacroBar({ label, value, goal, color, unit = 'g' }) {
  const progress = pct(value, goal);
  const over = value > goal;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ color: over ? 'var(--danger)' : 'var(--text-primary)' }}>
          <strong>{Math.round(value)}</strong>
          <span style={{ color: 'var(--text-muted)' }}> / {goal}{unit}</span>
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: over ? 'var(--danger)' : `linear-gradient(90deg, ${color}cc, ${color})`,
          }}
        />
      </div>
    </div>
  );
}
