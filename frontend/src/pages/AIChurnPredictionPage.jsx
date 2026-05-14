import React, { useState } from 'react';
import AIOutput from '../components/AIOutput';

export default function AIChurnPredictionPage() {
  const [windowDays, setWindowDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/churn-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ window_days: Number(windowDays) })
      });
      if (res.status === 503) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'AI service unavailable: API key not configured.');
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Request failed');
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to predict churn');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <div className="page-title-icon" style={{ background: '#ef4444' }}>
            <span className="material-icons-round">person_off</span>
          </div>
          <div>
            <h1>Churn Prediction</h1>
            <p>Score viewer profiles for churn risk and recommend interventions</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="data-table-container" style={{ padding: 24, marginBottom: 16 }}>
        <div className="form-grid">
          <div className="form-group">
            <label>Lookback window (days)</label>
            <input
              type="number"
              min="7"
              max="180"
              value={windowDays}
              onChange={e => setWindowDays(e.target.value)}
            />
          </div>
        </div>
        {error && <div className="notification error" style={{ position: 'relative', marginTop: 12 }}>{error}</div>}
        <div style={{ marginTop: 16 }}>
          <button type="submit" className="btn btn-ai" disabled={loading}>
            <span className="material-icons-round">auto_awesome</span>
            {loading ? 'Scoring...' : 'Predict Churn'}
          </button>
        </div>
      </form>

      <AIOutput data={result?.ai || result} loading={loading} />

      {result && result.profiles_analysed != null && (
        <div className="data-table-container" style={{ marginTop: 16, padding: 16, fontSize: 13, color: '#94a3b8' }}>
          Profiles analysed: {result.profiles_analysed} • Window: {result.window_days} days
        </div>
      )}
    </div>
  );
}
