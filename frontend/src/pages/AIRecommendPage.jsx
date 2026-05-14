import React, { useState } from 'react';
import { api } from '../api';
import AIOutput from '../components/AIOutput';

export default function AIRecommendPage({ user }) {
  const [userId, setUserId] = useState(user?.id || '');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('User ID is required');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId: Number(userId), count: Number(count) })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Request failed');
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch recommendations');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <div className="page-title-icon" style={{ background: '#3b82f6' }}>
            <span className="material-icons-round">auto_awesome</span>
          </div>
          <div>
            <h1>AI Recommend</h1>
            <p>Personalised picks from recent viewing history</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="data-table-container" style={{ padding: 24, marginBottom: 16 }}>
        <div className="form-grid">
          <div className="form-group">
            <label>User ID *</label>
            <input
              type="number"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>How many?</label>
            <input
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={e => setCount(e.target.value)}
            />
          </div>
        </div>
        {error && <div className="notification error" style={{ position: 'relative', marginTop: 12 }}>{error}</div>}
        <div style={{ marginTop: 16 }}>
          <button type="submit" className="btn btn-ai" disabled={loading}>
            <span className="material-icons-round">auto_awesome</span>
            {loading ? 'Generating...' : 'Generate Recommendations'}
          </button>
        </div>
      </form>

      <AIOutput data={result?.ai || result?.recommendations || result} loading={loading} />

      {result && Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
        <div className="data-table-container" style={{ marginTop: 16 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title / Content</th>
                <th>Reason</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {result.recommendations.map((r, i) => (
                <tr key={i}>
                  <td style={{ width: 40, color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>{r.title || r.contentTitle || `Content #${r.contentId || ''}`}</td>
                  <td>{r.reason || r.rationale || '-'}</td>
                  <td>{r.score ?? r.confidence ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
