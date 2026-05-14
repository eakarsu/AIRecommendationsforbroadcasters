import React, { useState } from 'react';
import AIOutput from '../components/AIOutput';

export default function AIAudienceSegmentationPage() {
  const [days, setDays] = useState(30);
  const [segmentCount, setSegmentCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/audience-segmentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ days: Number(days), segmentCount: Number(segmentCount) })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Request failed');
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to compute segmentation');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <div className="page-title-icon" style={{ background: '#a855f7' }}>
            <span className="material-icons-round">groups</span>
          </div>
          <div>
            <h1>Audience Segmentation</h1>
            <p>Cluster profiles by viewing taste and demographics</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="data-table-container" style={{ padding: 24, marginBottom: 16 }}>
        <div className="form-grid">
          <div className="form-group">
            <label>Window (days)</label>
            <input
              type="number"
              min="1"
              max="180"
              value={days}
              onChange={e => setDays(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Number of segments</label>
            <input
              type="number"
              min="2"
              max="10"
              value={segmentCount}
              onChange={e => setSegmentCount(e.target.value)}
            />
          </div>
        </div>
        {error && <div className="notification error" style={{ position: 'relative', marginTop: 12 }}>{error}</div>}
        <div style={{ marginTop: 16 }}>
          <button type="submit" className="btn btn-ai" disabled={loading}>
            <span className="material-icons-round">auto_awesome</span>
            {loading ? 'Segmenting...' : 'Generate Segments'}
          </button>
        </div>
      </form>

      <AIOutput data={result?.ai || result?.segments || result} loading={loading} />

      {result && Array.isArray(result.segments) && result.segments.length > 0 && (
        <div className="data-table-container" style={{ marginTop: 16 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Segment</th>
                <th>Profile</th>
                <th>Size</th>
                <th>Key Traits</th>
              </tr>
            </thead>
            <tbody>
              {result.segments.map((s, i) => (
                <tr key={i}>
                  <td style={{ width: 40, color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>{s.name || s.label || `Segment ${i + 1}`}</td>
                  <td>{s.description || s.profile || '-'}</td>
                  <td>{s.size ?? s.count ?? '-'}</td>
                  <td>{Array.isArray(s.traits) ? s.traits.join(', ') : (s.traits || s.keywords || '-')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
