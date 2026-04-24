import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import Sidebar from './components/Sidebar';

const features = [
  { key: 'content', label: 'Content Catalog', icon: 'movie', color: '#6366f1' },
  { key: 'categories', label: 'Categories', icon: 'category', color: '#8b5cf6' },
  { key: 'channels', label: 'Channels', icon: 'live_tv', color: '#06b6d4' },
  { key: 'sports', label: 'Live Sports', icon: 'sports_soccer', color: '#22c55e' },
  { key: 'profiles', label: 'User Profiles', icon: 'people', color: '#f59e0b' },
  { key: 'history', label: 'Viewing History', icon: 'history', color: '#ef4444' },
  { key: 'watchlist', label: 'Watchlist', icon: 'bookmark', color: '#ec4899' },
  { key: 'schedule', label: 'Schedule', icon: 'calendar_today', color: '#14b8a6' },
  { key: 'playlists', label: 'Playlists', icon: 'queue_music', color: '#a855f7' },
  { key: 'ratings', label: 'Ratings & Reviews', icon: 'star', color: '#f97316' },
  { key: 'recommendations', label: 'AI Recommendations', icon: 'auto_awesome', color: '#3b82f6', ai: true },
  { key: 'trending', label: 'Trending', icon: 'trending_up', color: '#10b981', ai: true },
  { key: 'analytics', label: 'Analytics', icon: 'analytics', color: '#6366f1', ai: true },
  { key: 'insights', label: 'AI Insights', icon: 'psychology', color: '#8b5cf6', ai: true },
  { key: 'search', label: 'AI Search', icon: 'search', color: '#0ea5e9', ai: true },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" />;
  }

  if (location.pathname === '/login') {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        features={features}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onLogout={handleLogout}
      />
      <main className={`main-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard features={features} />} />
          {features.map(f => (
            <Route key={f.key} path={`/${f.key}`} element={<FeaturePage feature={f} user={user} />} />
          ))}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}
