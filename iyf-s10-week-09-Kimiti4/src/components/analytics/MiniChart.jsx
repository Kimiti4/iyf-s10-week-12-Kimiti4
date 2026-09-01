/**
 * J-019: Mini Chart Component
 *
 * A lightweight sparkline chart for time-series data.
 * Uses SVG for rendering — no external charting library needed.
 */

import { useMemo } from 'react';
import '../../styles/Analytics.css';

export default function MiniChart({ data = [], height = 60, color = 'var(--brand-500)', className = '' }) {
  const points = useMemo(() => {
    if (!data.length) return '';

    const values = data.map((d) => d.views ?? d.engagement ?? d.value ?? 0);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const width = 200;
    const padding = 2;

    return values
      .map((v, i) => {
        const x = padding + (i / (values.length - 1)) * (width - padding * 2);
        const y = height - padding - ((v - min) / range) * (height - padding * 2);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [data, height]);

  if (!data.length) {
    return (
      <div className={`mini-chart mini-chart--empty ${className}`} style={{ height }}>
        <span className="mini-chart__placeholder">No data</span>
      </div>
    );
  }

  const values = data.map((d) => d.views ?? d.engagement ?? d.value ?? 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const width = 200;
  const padding = 2;

  // Area fill (closed path under the line)
  const areaPoints = useMemo(() => {
    const linePoints = values.map((v, i) => {
      const x = padding + (i / (values.length - 1)) * (width - padding * 2);
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return { x, y };
    });

    const bottom = height - padding;
    return `M ${padding} ${bottom} ${linePoints.map((p) => `L ${p.x} ${p.y}`).join(' ')} L ${width - padding} ${bottom} Z`;
  }, [values, height, min, range]);

  return (
    <div className={`mini-chart ${className}`} style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="mini-chart__svg"
      >
        <defs>
          <linearGradient id={`gradient-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={areaPoints} fill={`url(#gradient-${color.replace(/[^a-z0-9]/gi, '')})`} />
        <path d={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
