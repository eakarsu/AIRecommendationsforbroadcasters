import React, { useEffect, useState } from 'react';

// VIZ: Content Engagement Chart (line/area chart of viewers per content type)
export default function EngagementChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);

  useEffect(() => { load(); }, [days]);

  async function load() {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/custom-views/engagement?days=' + days, {
        headers: token ? { Authorization: 'Bearer ' + token } : {},
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');
      setData(j);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  if (loading) return <div style={{ padding: 16, color: '#666' }}>Loading engagement data...</div>;
  if (error) return <div style={{ padding: 16, color: '#900' }}>Error: {error}</div>;
  if (!data) return null;

  const COLORS = ['#6366f1', '#22c55e', '#ef4444', '#f59e0b', '#06b6d4'];
  const width = 720, height = 260, padding = 36;
  // flatten viewers for scale
  const allValues = data.series.flatMap((s) => s.points.map((p) => p.viewers));
  const maxV = Math.max(...allValues, 1);
  const n = data.series[0]?.points.length || 1;
  const xStep = (width - padding * 2) / Math.max(1, n - 1);

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16 }}>Content Engagement</h3>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: 12 }}>Daily viewers by content type</p>
        </div>
        <select value={days} onChange={(e) => setDays(parseInt(e.target.value, 10))}
          style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4 }}>
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        {/* axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ddd" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ddd" />
        {/* y ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = height - padding - t * (height - padding * 2);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f5f9" />
              <text x={padding - 6} y={y + 3} fontSize="9" textAnchor="end" fill="#888">{Math.round(maxV * t)}</text>
            </g>
          );
        })}
        {/* series lines */}
        {data.series.map((s, idx) => {
          const points = s.points.map((p, i) => {
            const x = padding + i * xStep;
            const y = height - padding - (p.viewers / maxV) * (height - padding * 2);
            return x + ',' + y;
          }).join(' ');
          return <polyline key={s.contentType} fill="none" stroke={COLORS[idx % COLORS.length]} strokeWidth="2" points={points} />;
        })}
      </svg>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
        {data.series.map((s, idx) => (
          <div key={s.contentType} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, background: COLORS[idx % COLORS.length], borderRadius: 2, display: 'inline-block' }} />
            <span>{s.contentType}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
