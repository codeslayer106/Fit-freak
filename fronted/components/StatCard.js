// components/StatCard.js
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ label, value, unit, icon, color, trend, trendLabel, onClick }) {
  const trendIcon = trend > 0
    ? <TrendingUp size={14} />
    : trend < 0
    ? <TrendingDown size={14} />
    : <Minus size={14} />;

  const trendColor = trend > 0 ? 'var(--success)' : trend < 0 ? 'var(--danger)' : 'var(--text-muted)';

  return (
    <div
      className={`card ${onClick ? 'cursor-pointer' : ''} animate-slide-up`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}20` }}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs font-medium" style={{ color: trendColor }}>
            {trendIcon}
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}
        {unit && <span className="text-base font-normal ml-1" style={{ color: 'var(--text-muted)' }}>{unit}</span>}
      </p>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  );
}
