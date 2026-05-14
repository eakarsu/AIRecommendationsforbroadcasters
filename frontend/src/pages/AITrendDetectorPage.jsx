import React, { useState } from 'react';
import AIOutput from '../components/AIOutput';

export default function AITrendDetectorPage() {
  const [days, setDays] = useState(14);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/trend-detector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ days: Number(days) })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Request failed');
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to detect trends');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <div className="page-title-icon" style={{ background: '#10b981' }}>
            <span className="material-icons-round">trending_up</span>
          </div>
          <div>
            <h1>Trend Detector</h1>
            <p>Detect emerging viewing trends from history</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="data-table-container" style={{ padding: 24, marginBottom: 16 }}>
        <div className="form-grid">
          <div className="form-group">
            <label>Lookback window (days)</label>
            <input
              type="number"
              min="1"
              max="90"
              value={days}
              onChange={e => setDays(e.target.value)}
            />
          </div>
        </div>
        {error && <div className="notification error" style={{ position: 'relative', marginTop: 12 }}>{error}</div>}
        <div style={{ marginTop: 16 }}>
          <button type="submit" className="btn btn-ai" disabled={loading}>
            <span className="material-icons-round">auto_awesome</span>
            {loading ? 'Detecting...' : 'Detect Trends'}
          </button>
        </div>
      </form>

      <AIOutput data={result?.ai || result?.trends || result} loading={loading} />

      {result && Array.isArray(result.trends) && result.trends.length > 0 && (
        <div className="data-table-container" style={{ marginTop: 16 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Trend</th>
                <th>Signal</th>
                <th>Strength</th>
              </tr>
            </thead>
            <tbody>
              {result.trends.map((t, i) => (
                <tr key={i}>
                  <td style={{ width: 40, color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>{t.name || t.title || t.trend || '-'}</td>
                  <td>{t.signal || t.evidence || t.description || '-'}</td>
                  <td>{t.strength ?? t.score ?? t.growth ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
