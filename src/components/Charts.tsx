import { RankedItem } from '../lib/analytics';

/* Lightweight, dependency-free SVG charts. All colors come from CSS
   variables so they follow the app's light/dark theme automatically. */

interface MonthDatum {
  label: string;
  borrows: number;
  returns: number;
}

/** Grouped monthly bars: borrows vs. returns over the last 12 months. */
export function MonthlyBars({ data }: { data: MonthDatum[] }) {
  const W = 720;
  const H = 240;
  const pad = { top: 16, right: 12, bottom: 28, left: 28 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = Math.max(1, ...data.map((d) => Math.max(d.borrows, d.returns)));
  const groupW = innerW / data.length;
  const barW = Math.min(14, groupW / 3);

  const ticks = 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Empréstimos e devoluções por mês">
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const y = pad.top + (innerH / ticks) * i;
        const val = Math.round(max - (max / ticks) * i);
        return (
          <g key={i}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} className="chart-grid" />
            <text x={pad.left - 6} y={y + 3} className="chart-axis" textAnchor="end">{val}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const gx = pad.left + groupW * i + groupW / 2;
        const bH = (d.borrows / max) * innerH;
        const rH = (d.returns / max) * innerH;
        return (
          <g key={i}>
            <rect
              x={gx - barW - 1} y={pad.top + innerH - bH}
              width={barW} height={bH} rx={3}
              fill="var(--amber)"
            >
              <title>{`${d.label}: ${d.borrows} empréstimos`}</title>
            </rect>
            <rect
              x={gx + 1} y={pad.top + innerH - rH}
              width={barW} height={rH} rx={3}
              fill="var(--green)"
            >
              <title>{`${d.label}: ${d.returns} devoluções`}</title>
            </rect>
            <text x={gx} y={H - 10} className="chart-axis" textAnchor="middle">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Donut chart for the book-status distribution. */
export function Donut({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: number | string;
}) {
  const size = 180;
  const r = 70;
  const stroke = 26;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = Math.max(1, segments.reduce((s, x) => s + x.value, 0));
  let offset = 0;

  return (
    <div className="donut-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} className="donut" role="img" aria-label={centerLabel}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--cream-3)" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * circumference;
          const el = (
            <circle
              key={i}
              cx={c} cy={c} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${c} ${c})`}
              strokeLinecap="butt"
            >
              <title>{`${s.label}: ${s.value}`}</title>
            </circle>
          );
          offset += dash;
          return el;
        })}
        <text x={c} y={c - 4} className="donut-value" textAnchor="middle">{centerValue}</text>
        <text x={c} y={c + 16} className="donut-label" textAnchor="middle">{centerLabel}</text>
      </svg>
      <ul className="donut-legend">
        {segments.map((s, i) => (
          <li key={i}>
            <span className="donut-dot" style={{ background: s.color }} />
            {s.label}
            <strong>{s.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal ranked bars (e.g. most-read authors). */
export function RankBars({
  items,
  emptyLabel = 'Sem dados ainda',
  accent = 'var(--amber)',
}: {
  items: RankedItem[];
  emptyLabel?: string;
  accent?: string;
}) {
  if (items.length === 0) {
    return <p className="rank-empty">{emptyLabel}</p>;
  }
  const max = Math.max(...items.map((i) => i.value));
  return (
    <ol className="rank-list">
      {items.map((it, i) => (
        <li key={it.label} className="rank-row">
          <span className="rank-pos">{i + 1}</span>
          <span className="rank-label" title={it.label}>{it.label}</span>
          <span className="rank-bar-track">
            <span
              className="rank-bar-fill"
              style={{ width: `${(it.value / max) * 100}%`, background: accent }}
            />
          </span>
          <span className="rank-value">{it.value}</span>
        </li>
      ))}
    </ol>
  );
}
