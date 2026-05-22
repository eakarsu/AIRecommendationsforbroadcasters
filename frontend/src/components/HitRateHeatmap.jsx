import React, { useEffect, useState } from 'react';

// VIZ: Recommendation Hit-Rate Heatmap (segment x content type)
export default function HitRateHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/custom-views/hit-rate-heatmap', {
        headers: token ? { Authorization: 'Bearer ' + token } : {},
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');
      setData(j);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  if (loading) return <div style={{ padding: 16, color: '#666' }}>Loading heatmap...</div>;
  if (error) return <div style={{ padding: 16, color: '#900' }}>Error: {error}</div>;
  if (!data) return null;

  // color: 0 -> #f3f4f6, 1 -> #1d4ed8
  function color(v) {
    const t = Math.max(0, Math.min(1, v));
    const r = Math.round(243 + (29 - 243) * t);
    const g = Math.round(244 + (78 - 244) * t);
    const b = Math.round(246 + (216 - 246) * t);
    return `rgb(${r},${g},${b})`;
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>Recommendation Hit Rate</h3>
      <p style={{ margin: '0 0 12px', color: '#666', fontSize: 12 }}>Audience segment x content type</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ padding: 6, textAlign: 'left' }}></th>
              {data.contentTypes.map((ct) => (
                <th key={ct} style={{ padding: 6, fontWeight: 600, textAlign: 'center', color: '#333' }}>{ct}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.segments.map((seg, i) => (
              <tr key={seg}>
                <td style={{ padding: 6, fontWeight: 600, color: '#333', whiteSpace: 'nowrap' }}>{seg}</td>
                {data.matrix[i].map((v, j) => (
                  <td key={j} style={{
                    background: color(v),
                    color: v > 0.55 ? '#fff' : '#111',
                    padding: '10px 14px',
                    textAlign: 'center',
                    border: '1px solid #fff',
                    minWidth: 70,
                  }}>{(v * 100).toFixed(1)}%</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 11, color: '#555' }}>
        <span>Low</span>
        <div style={{ width: 160, height: 10, background: 'linear-gradient(to right, rgb(243,244,246), rgb(29,78,216))', borderRadius: 2 }} />
        <span>High</span>
      </div>
    </div>
  );
}
