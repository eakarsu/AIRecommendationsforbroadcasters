import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const descriptions = {
  content: 'Manage your entire content catalog across all genres',
  categories: 'Organize content into browsable categories',
  channels: 'Manage broadcast and streaming channels',
  sports: 'Live sports events and scheduling',
  profiles: 'Viewer profiles and preference management',
  history: 'Track and analyze viewing history',
  watchlist: 'User watchlists and saved content',
  schedule: 'Broadcast schedule management',
  playlists: 'Curated content playlists',
  ratings: 'Content ratings and user reviews',
  recommendations: 'AI-powered personalized content picks',
  trending: 'Real-time trending content analytics',
  analytics: 'Audience analytics and performance data',
  insights: 'AI-generated strategic insights',
  search: 'Natural language AI-powered search',
};

export default function Dashboard({ features }) {
  const navigate = useNavigate();
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingResult, setTrendingResult] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleResult, setScheduleResult] = useState(null);
  const [completionRates, setCompletionRates] = useState(null);
  const [watchTime, setWatchTime] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const notify = (msg, type = 'success') => { setNotification({ msg, type }); setTimeout(() => setNotification(null), 4000); };

  const handleComputeTrending = async () => {
    setTrendingLoading(true);
    setTrendingResult(null);
    try {
      const data = await api.computeTrending();
      setTrendingResult(data);
      notify(`Trending computed: ${data.updates?.length || 0} content items updated`);
    } catch (e) { notify(e.message, 'error'); }
    setTrendingLoading(false);
  };

  const handleOptimizeSchedule = async () => {
    setScheduleLoading(true);
    setScheduleResult(null);
    try {
      const data = await api.optimizeSchedule();
      setScheduleResult(data);
      notify('Schedule optimization complete');
    } catch (e) { notify(e.message, 'error'); }
    setScheduleLoading(false);
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const [cr, wt] = await Promise.all([api.getCompletionRates(), api.getWatchTime(30)]);
      setCompletionRates(cr);
      setWatchTime(wt);
    } catch (e) { notify(e.message, 'error'); }
    setAnalyticsLoading(false);
  };

  useEffect(() => { loadAnalytics(); }, []);

  return (
    <div>
      {notification && (
        <div style={{ position: 'fixed', top: 20, right: 20, padding: '12px 20px', borderRadius: 8, background: notification.type === 'error' ? '#7f1d1d' : '#14532d', color: '#fff', zIndex: 9999, fontWeight: 600 }}>
          {notification.msg}
        </div>
      )}

      <div className="dashboard-header">
        <h1>Welcome to BroadcastAI</h1>
        <p>Your AI-powered content intelligence platform for smarter viewer engagement</p>
      </div>

      {/* Analytics Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Completion Rates Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ color: '#60a5fa', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons-round" style={{ fontSize: 20 }}>bar_chart</span>
            Completion Rates
          </h3>
          {analyticsLoading ? <div className="spinner" /> : completionRates ? (
            <>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#22c55e' }}>{completionRates.summary?.avgCompletionRate || '0'}%</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>Average completion rate</div>
              {(completionRates.data || []).slice(0, 3).map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{r.title || `Content #${r.contentId}`}</span>
                  <span style={{ color: parseFloat(r.completionRate) > 70 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>{r.completionRate}%</span>
                </div>
              ))}
            </>
          ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet</p>}
        </div>

        {/* Watch Time Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ color: '#f59e0b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons-round" style={{ fontSize: 20 }}>schedule</span>
            Watch Time (30 days)
          </h3>
          {analyticsLoading ? <div className="spinner" /> : watchTime ? (
            <>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#f59e0b' }}>{watchTime.summary?.totalHours || '0'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>Total hours watched</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{watchTime.summary?.totalSessions || 0} sessions</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Top: <span style={{ color: '#f59e0b' }}>{watchTime.summary?.topContent || 'N/A'}</span></div>
              {(watchTime.data || []).slice(0, 3).map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)', fontSize: 13, marginTop: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{r.title || `Content #${r.contentId}`}</span>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>{r.totalHours}h</span>
                </div>
              ))}
            </>
          ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet</p>}
        </div>

        {/* Quick Actions */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ color: '#8b5cf6', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons-round" style={{ fontSize: 20 }}>auto_awesome</span>
            AI Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-ai" onClick={handleComputeTrending} disabled={trendingLoading} style={{ justifyContent: 'flex-start' }}>
              <span className="material-icons-round">trending_up</span>
              {trendingLoading ? 'Computing...' : 'Compute Trending'}
            </button>
            <button className="btn btn-ai" onClick={handleOptimizeSchedule} disabled={scheduleLoading} style={{ justifyContent: 'flex-start' }}>
              <span className="material-icons-round">auto_fix_high</span>
              {scheduleLoading ? 'Optimizing...' : 'Optimize Schedule'}
            </button>
            <button className="btn btn-secondary" onClick={loadAnalytics} disabled={analyticsLoading} style={{ justifyContent: 'flex-start' }}>
              <span className="material-icons-round">refresh</span>
              Refresh Analytics
            </button>
          </div>

          {trendingResult && (
            <div style={{ marginTop: 12, background: 'var(--bg)', borderRadius: 8, padding: 12, fontSize: 12 }}>
              <div style={{ color: '#22c55e', fontWeight: 600, marginBottom: 4 }}>Trending updated: {trendingResult.updates?.length || 0} items</div>
              {(trendingResult.updates || []).slice(0, 3).map((u, i) => (
                <div key={i} style={{ color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                  <span>#{u.contentId}</span>
                  <span style={{ color: parseFloat(u.growthRate) > 0 ? '#22c55e' : '#ef4444' }}>{u.growthRate > 0 ? '+' : ''}{u.growthRate}%</span>
                </div>
              ))}
            </div>
          )}

          {scheduleResult?.ai && (
            <div style={{ marginTop: 12, background: 'var(--bg)', borderRadius: 8, padding: 12, fontSize: 12 }}>
              <div style={{ color: '#8b5cf6', fontWeight: 600, marginBottom: 4 }}>Schedule Insight Saved</div>
              <div style={{ color: 'var(--text-muted)' }}>{scheduleResult.ai?.summary?.substring(0, 100)}...</div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="dashboard-grid">
        {features.map(f => (
          <div
            key={f.key}
            className="dashboard-card"
            style={{ '--card-color': f.color }}
            onClick={() => navigate(`/${f.key}`)}
          >
            {f.ai && <span className="card-ai-tag">AI POWERED</span>}
            <div className="card-icon" style={{ background: f.color }}>
              <span className="material-icons-round">{f.icon}</span>
            </div>
            <h3>{f.label}</h3>
            <p>{descriptions[f.key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
