import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ features, open, onToggle, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const contentFeatures = features.filter(f => !f.ai);
  const aiFeatures = features.filter(f => f.ai);

  return (
    <nav className={`sidebar ${open ? '' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="material-icons-round">smart_display</span>
        </div>
        {open && (
          <div className="sidebar-brand">
            <h1>BroadcastAI</h1>
            <p>Content Intelligence Hub</p>
          </div>
        )}
      </div>

      <button className="sidebar-toggle" onClick={onToggle}>
        <span className="material-icons-round" style={{ fontSize: 16 }}>
          {open ? 'chevron_left' : 'chevron_right'}
        </span>
      </button>

      <div className="sidebar-nav">
        <div
          className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <span className="material-icons-round">dashboard</span>
          {open && <span>Dashboard</span>}
        </div>

        {open && <div className="nav-section-label">Content Management</div>}

        {contentFeatures.map(f => (
          <div
            key={f.key}
            className={`nav-item ${location.pathname === `/${f.key}` ? 'active' : ''}`}
            onClick={() => navigate(`/${f.key}`)}
          >
            <span className="material-icons-round" style={{ color: f.color }}>{f.icon}</span>
            {open && <span>{f.label}</span>}
          </div>
        ))}

        {open && <div className="nav-section-label">AI & Intelligence</div>}

        {aiFeatures.map(f => (
          <div
            key={f.key}
            className={`nav-item ${location.pathname === `/${f.key}` ? 'active' : ''}`}
            onClick={() => navigate(`/${f.key}`)}
          >
            <span className="material-icons-round" style={{ color: f.color }}>{f.icon}</span>
            {open && (
              <>
                <span>{f.label}</span>
                <span className="ai-badge">AI</span>
              </>
            )}
          </div>
        ))}

        {open && <div className="nav-section-label">Custom</div>}
        <div
          className={`nav-item ${location.pathname === '/custom-views' ? 'active' : ''}`}
          onClick={() => navigate('/custom-views')}
          data-testid="nav-broadcast-views"
        >
          <span className="material-icons-round" style={{ color: '#0ea5e9' }}>insights</span>
          {open && <span>Broadcast Views</span>}
        </div>

        {open && <div className="nav-section-label">Gap Features</div>}
        {[
          { path: '/gap-no-recommend-personalized-content-recommenda', label: 'Personalized Recommend', icon: 'recommend', color: '#f43f5e' },
          { path: '/gap-no-scheduleoptimizer-programming-schedule-vi', label: 'Schedule Optimizer', icon: 'schedule', color: '#f97316' },
          { path: '/gap-no-trenddetector-emerging-content-discovery', label: 'Trend Detector', icon: 'trending_up', color: '#eab308' },
          { path: '/gap-no-audiencesegmentation-taste-clustering', label: 'Audience Segmentation', icon: 'people', color: '#22c55e' },
          { path: '/gap-no-sportshighlightextraction-autoclip-moment', label: 'Sports Highlights', icon: 'sports', color: '#06b6d4' },
          { path: '/gap-no-subtitlegeneration-auto-captions', label: 'Auto Captions', icon: 'closed_caption', color: '#3b82f6' },
          { path: '/gap-no-user-preference-learning-loop-implicit-fe', label: 'Preference Learning', icon: 'tune', color: '#8b5cf6' },
          { path: '/gap-no-ab-testing-framework-for-schedule-changes', label: 'A/B Schedule Testing', icon: 'science', color: '#ec4899' },
          { path: '/gap-limited-audience-analytics-depth', label: 'Audience Analytics', icon: 'analytics', color: '#f43f5e' },
          { path: '/gap-no-sports-data-api-integration-scores-stats', label: 'Sports Data API', icon: 'sports_score', color: '#10b981' },
          { path: '/gap-no-cdnstreaming-platform-integration', label: 'CDN Streaming', icon: 'stream', color: '#0ea5e9' },
          { path: '/gap-no-admonetization-layer', label: 'Ad Monetization', icon: 'attach_money', color: '#f59e0b' },
          { path: '/gap-no-notificationsalerts-for-new-content', label: 'Notifications', icon: 'notifications', color: '#a855f7' },
        ].map(({ path, label, icon, color }) => (
          <div
            key={path}
            className={`nav-item ${location.pathname === path ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <span className="material-icons-round" style={{ color }}>{icon}</span>
            {open && <span>{label}</span>}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-avatar">
          {user?.name?.charAt(0) || 'U'}
        </div>
        {open && (
          <>
            <div className="user-info">
              <p>{user?.name}</p>
              <p>{user?.role}</p>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Logout">
              <span className="material-icons-round" style={{ fontSize: 20 }}>logout</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
