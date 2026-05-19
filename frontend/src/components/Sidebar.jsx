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
