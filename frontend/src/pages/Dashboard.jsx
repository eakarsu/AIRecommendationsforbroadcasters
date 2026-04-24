import React from 'react';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div>
      <div className="dashboard-header">
        <h1>Welcome to BroadcastAI</h1>
        <p>Your AI-powered content intelligence platform for smarter viewer engagement</p>
      </div>

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
