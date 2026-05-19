import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import AIRecommendPage from './pages/AIRecommendPage';
import AITrendDetectorPage from './pages/AITrendDetectorPage';
import AIAudienceSegmentationPage from './pages/AIAudienceSegmentationPage';
import AIChurnPredictionPage from './pages/AIChurnPredictionPage';
import CustomViewsPage from './pages/CustomViewsPage';
import Sidebar from './components/Sidebar';

// === Batch 07 Gaps & Frontend Mounts ===
import CfPersonalizedScheduleGeneration from './pages/CfPersonalizedScheduleGeneration';
import CfMulticategoryPlaylistBuilder from './pages/CfMulticategoryPlaylistBuilder';
import CfLiveEventOptimization from './pages/CfLiveEventOptimization';
import CfChurnPredictionRetention from './pages/CfChurnPredictionRetention';
import CfCollaborativeFilteringAtScale from './pages/CfCollaborativeFilteringAtScale';
import CfSportsspecificIntelligence from './pages/CfSportsspecificIntelligence';
import GapNoRecommendPersonalizedContentRecommenda from './pages/GapNoRecommendPersonalizedContentRecommenda';
import GapNoScheduleoptimizerProgrammingScheduleVi from './pages/GapNoScheduleoptimizerProgrammingScheduleVi';
import GapNoTrenddetectorEmergingContentDiscovery from './pages/GapNoTrenddetectorEmergingContentDiscovery';
import GapNoAudiencesegmentationTasteClustering from './pages/GapNoAudiencesegmentationTasteClustering';
import GapNoSportshighlightextractionAutoclipMoment from './pages/GapNoSportshighlightextractionAutoclipMoment';
import GapNoSubtitlegenerationAutoCaptions from './pages/GapNoSubtitlegenerationAutoCaptions';
import GapNoUserPreferenceLearningLoopImplicitFe from './pages/GapNoUserPreferenceLearningLoopImplicitFe';
import GapNoAbTestingFrameworkForScheduleChanges from './pages/GapNoAbTestingFrameworkForScheduleChanges';
import GapLimitedAudienceAnalyticsDepth from './pages/GapLimitedAudienceAnalyticsDepth';
import GapNoSportsDataApiIntegrationScoresStats from './pages/GapNoSportsDataApiIntegrationScoresStats';
import GapNoCdnstreamingPlatformIntegration from './pages/GapNoCdnstreamingPlatformIntegration';
import GapNoAdmonetizationLayer from './pages/GapNoAdmonetizationLayer';
import GapNoNotificationsalertsForNewContent from './pages/GapNoNotificationsalertsForNewContent';
// === End Batch 07 ===


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
  { key: 'ai-insights-dashboard', label: 'AI Dashboard', icon: 'dashboard', color: '#f59e0b', ai: true },
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
          <Route path="/ai-recommend" element={<AIRecommendPage user={user} />} />
          <Route path="/ai-trend-detector" element={<AITrendDetectorPage />} />
          <Route path="/ai-audience-segmentation" element={<AIAudienceSegmentationPage />} />
          <Route path="/ai-churn-prediction" element={<AIChurnPredictionPage />} />
          <Route path="/custom-views" element={<CustomViewsPage />} />
          {features.map(f => (
            <Route key={f.key} path={`/${f.key}`} element={<FeaturePage feature={f} user={user} />} />
          ))}
          <Route path="*" element={<Navigate to="/dashboard" />} />
          // === Batch 07 Gaps & Frontend Mounts ===
          <Route path='/cf-personalized-schedule-generation' element={<CfPersonalizedScheduleGeneration />} />
          <Route path='/cf-multicategory-playlist-builder' element={<CfMulticategoryPlaylistBuilder />} />
          <Route path='/cf-live-event-optimization' element={<CfLiveEventOptimization />} />
          <Route path='/cf-churn-prediction-retention' element={<CfChurnPredictionRetention />} />
          <Route path='/cf-collaborative-filtering-at-scale' element={<CfCollaborativeFilteringAtScale />} />
          <Route path='/cf-sportsspecific-intelligence' element={<CfSportsspecificIntelligence />} />
          <Route path='/gap-no-recommend-personalized-content-recommenda' element={<GapNoRecommendPersonalizedContentRecommenda />} />
          <Route path='/gap-no-scheduleoptimizer-programming-schedule-vi' element={<GapNoScheduleoptimizerProgrammingScheduleVi />} />
          <Route path='/gap-no-trenddetector-emerging-content-discovery' element={<GapNoTrenddetectorEmergingContentDiscovery />} />
          <Route path='/gap-no-audiencesegmentation-taste-clustering' element={<GapNoAudiencesegmentationTasteClustering />} />
          <Route path='/gap-no-sportshighlightextraction-autoclip-moment' element={<GapNoSportshighlightextractionAutoclipMoment />} />
          <Route path='/gap-no-subtitlegeneration-auto-captions' element={<GapNoSubtitlegenerationAutoCaptions />} />
          <Route path='/gap-no-user-preference-learning-loop-implicit-fe' element={<GapNoUserPreferenceLearningLoopImplicitFe />} />
          <Route path='/gap-no-ab-testing-framework-for-schedule-changes' element={<GapNoAbTestingFrameworkForScheduleChanges />} />
          <Route path='/gap-limited-audience-analytics-depth' element={<GapLimitedAudienceAnalyticsDepth />} />
          <Route path='/gap-no-sports-data-api-integration-scores-stats' element={<GapNoSportsDataApiIntegrationScoresStats />} />
          <Route path='/gap-no-cdnstreaming-platform-integration' element={<GapNoCdnstreamingPlatformIntegration />} />
          <Route path='/gap-no-admonetization-layer' element={<GapNoAdmonetizationLayer />} />
          <Route path='/gap-no-notificationsalerts-for-new-content' element={<GapNoNotificationsalertsForNewContent />} />
          // === End Batch 07 ===
        </Routes>
      </main>
    </div>
  );
}
