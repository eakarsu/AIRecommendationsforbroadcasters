import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import AIOutput from '../components/AIOutput';

// Column definitions for each feature
const featureConfig = {
  content: {
    columns: ['title', 'type', 'genre', 'duration', 'rating', 'status', 'viewCount'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'type', label: 'Type', type: 'select', options: ['movie', 'series', 'live_sport', 'documentary', 'news', 'soap_opera', 'reality_show', 'talk_show'] },
      { key: 'genre', label: 'Genre', type: 'text' },
      { key: 'duration', label: 'Duration (min)', type: 'number' },
      { key: 'rating', label: 'Rating', type: 'number' },
      { key: 'releaseDate', label: 'Release Date', type: 'date' },
      { key: 'language', label: 'Language', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'archived', 'upcoming'] },
      { key: 'viewCount', label: 'View Count', type: 'number' },
    ],
    detailFields: ['title', 'description', 'type', 'genre', 'duration', 'rating', 'releaseDate', 'language', 'tags', 'status', 'viewCount'],
  },
  categories: {
    columns: ['name', 'description', 'color', 'isActive', 'sortOrder'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'icon', label: 'Icon', type: 'text' },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'isActive', label: 'Active', type: 'select', options: ['true', 'false'] },
      { key: 'sortOrder', label: 'Sort Order', type: 'number' },
    ],
    detailFields: ['name', 'description', 'icon', 'color', 'isActive', 'sortOrder'],
  },
  channels: {
    columns: ['name', 'type', 'region', 'isLive', 'viewerCount', 'status'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'type', label: 'Type', type: 'select', options: ['broadcast', 'streaming', 'on_demand', 'premium'] },
      { key: 'region', label: 'Region', type: 'text' },
      { key: 'language', label: 'Language', type: 'text' },
      { key: 'isLive', label: 'Is Live', type: 'select', options: ['true', 'false'] },
      { key: 'viewerCount', label: 'Viewer Count', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'maintenance'] },
    ],
    detailFields: ['name', 'description', 'type', 'region', 'language', 'isLive', 'viewerCount', 'status'],
  },
  sports: {
    columns: ['title', 'sport', 'league', 'teamHome', 'teamAway', 'status', 'viewerCount'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'sport', label: 'Sport', type: 'text', required: true },
      { key: 'league', label: 'League', type: 'text' },
      { key: 'teamHome', label: 'Home Team', type: 'text' },
      { key: 'teamAway', label: 'Away Team', type: 'text' },
      { key: 'venue', label: 'Venue', type: 'text' },
      { key: 'startTime', label: 'Start Time', type: 'datetime-local' },
      { key: 'endTime', label: 'End Time', type: 'datetime-local' },
      { key: 'status', label: 'Status', type: 'select', options: ['upcoming', 'live', 'completed', 'postponed'] },
      { key: 'channelId', label: 'Channel ID', type: 'number' },
    ],
    detailFields: ['title', 'sport', 'league', 'teamHome', 'teamAway', 'venue', 'startTime', 'endTime', 'status', 'viewerCount'],
  },
  profiles: {
    columns: ['displayName', 'age', 'location', 'subscriptionTier', 'watchTime', 'devicePreference'],
    fields: [
      { key: 'displayName', label: 'Display Name', type: 'text', required: true },
      { key: 'userId', label: 'User ID', type: 'number' },
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'gender', label: 'Gender', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'subscriptionTier', label: 'Subscription', type: 'select', options: ['free', 'basic', 'premium', 'family'] },
      { key: 'devicePreference', label: 'Device Preference', type: 'text' },
      { key: 'notificationsEnabled', label: 'Notifications', type: 'select', options: ['true', 'false'] },
    ],
    detailFields: ['displayName', 'age', 'gender', 'location', 'favoriteGenres', 'favoriteTeams', 'watchTime', 'subscriptionTier', 'devicePreference', 'notificationsEnabled'],
  },
  history: {
    columns: ['contentId', 'userId', 'duration', 'progress', 'completed', 'device', 'watchedAt'],
    fields: [
      { key: 'userId', label: 'User ID', type: 'number', required: true },
      { key: 'contentId', label: 'Content ID', type: 'number', required: true },
      { key: 'duration', label: 'Duration (min)', type: 'number' },
      { key: 'completed', label: 'Completed', type: 'select', options: ['true', 'false'] },
      { key: 'progress', label: 'Progress (%)', type: 'number' },
      { key: 'device', label: 'Device', type: 'text' },
      { key: 'rating', label: 'Rating', type: 'number' },
    ],
    detailFields: ['userId', 'contentId', 'watchedAt', 'duration', 'completed', 'progress', 'device', 'rating'],
    showContentName: true,
  },
  watchlist: {
    columns: ['contentId', 'userId', 'priority', 'notes', 'addedAt'],
    fields: [
      { key: 'userId', label: 'User ID', type: 'number', required: true },
      { key: 'contentId', label: 'Content ID', type: 'number', required: true },
      { key: 'priority', label: 'Priority', type: 'select', options: ['high', 'medium', 'low'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    detailFields: ['userId', 'contentId', 'priority', 'notes', 'addedAt'],
    showContentName: true,
  },
  schedule: {
    columns: ['title', 'startTime', 'endTime', 'isPrimetime', 'isRepeat', 'status'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'contentId', label: 'Content ID', type: 'number' },
      { key: 'channelId', label: 'Channel ID', type: 'number' },
      { key: 'startTime', label: 'Start Time', type: 'datetime-local', required: true },
      { key: 'endTime', label: 'End Time', type: 'datetime-local', required: true },
      { key: 'isPrimetime', label: 'Primetime', type: 'select', options: ['true', 'false'] },
      { key: 'isRepeat', label: 'Repeat', type: 'select', options: ['true', 'false'] },
      { key: 'status', label: 'Status', type: 'select', options: ['scheduled', 'airing', 'completed', 'cancelled'] },
    ],
    detailFields: ['title', 'contentId', 'channelId', 'startTime', 'endTime', 'isPrimetime', 'isRepeat', 'status'],
  },
  playlists: {
    columns: ['name', 'description', 'itemCount', 'isPublic', 'curatedBy'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'isPublic', label: 'Public', type: 'select', options: ['true', 'false'] },
      { key: 'curatedBy', label: 'Curated By', type: 'text' },
    ],
    detailFields: ['name', 'description', 'itemCount', 'isPublic', 'curatedBy', 'tags'],
  },
  ratings: {
    columns: ['contentId', 'userId', 'score', 'review', 'helpful', 'verified'],
    fields: [
      { key: 'userId', label: 'User ID', type: 'number', required: true },
      { key: 'contentId', label: 'Content ID', type: 'number', required: true },
      { key: 'score', label: 'Score (0-5)', type: 'number', required: true },
      { key: 'review', label: 'Review', type: 'textarea' },
      { key: 'helpful', label: 'Helpful Votes', type: 'number' },
      { key: 'verified', label: 'Verified', type: 'select', options: ['true', 'false'] },
    ],
    detailFields: ['userId', 'contentId', 'score', 'review', 'helpful', 'verified'],
    showContentName: true,
  },
  recommendations: {
    columns: ['contentId', 'userId', 'reason', 'score', 'algorithm', 'status'],
    fields: [
      { key: 'userId', label: 'User ID', type: 'number' },
      { key: 'contentId', label: 'Content ID', type: 'number' },
      { key: 'reason', label: 'Reason', type: 'textarea' },
      { key: 'score', label: 'Score', type: 'number' },
      { key: 'algorithm', label: 'Algorithm', type: 'select', options: ['ai_personalized', 'collaborative', 'content_based', 'trending', 'editorial'] },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'dismissed', 'watched'] },
    ],
    detailFields: ['userId', 'contentId', 'reason', 'score', 'algorithm', 'status'],
    ai: 'recommend',
    showContentName: true,
  },
  trending: {
    columns: ['contentId', 'trendScore', 'viewsToday', 'viewsWeek', 'growthRate', 'region', 'rank'],
    fields: [
      { key: 'contentId', label: 'Content ID', type: 'number', required: true },
      { key: 'trendScore', label: 'Trend Score', type: 'number' },
      { key: 'viewsToday', label: 'Views Today', type: 'number' },
      { key: 'viewsWeek', label: 'Views This Week', type: 'number' },
      { key: 'growthRate', label: 'Growth Rate (%)', type: 'number' },
      { key: 'region', label: 'Region', type: 'text' },
      { key: 'rank', label: 'Rank', type: 'number' },
      { key: 'category', label: 'Category', type: 'text' },
    ],
    detailFields: ['contentId', 'trendScore', 'viewsToday', 'viewsWeek', 'growthRate', 'region', 'rank', 'category'],
    ai: 'trend',
    showContentName: true,
  },
  analytics: {
    columns: ['metric', 'value', 'date', 'region', 'demographic'],
    fields: [
      { key: 'metric', label: 'Metric', type: 'select', options: ['daily_viewers', 'avg_watch_time', 'completion_rate', 'engagement_score', 'new_subscribers'], required: true },
      { key: 'value', label: 'Value', type: 'number', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'contentId', label: 'Content ID', type: 'number' },
      { key: 'channelId', label: 'Channel ID', type: 'number' },
      { key: 'region', label: 'Region', type: 'text' },
      { key: 'demographic', label: 'Demographic', type: 'text' },
    ],
    detailFields: ['metric', 'value', 'date', 'contentId', 'channelId', 'region', 'demographic', 'metadata'],
    ai: 'analyze',
  },
  insights: {
    columns: ['title', 'type', 'confidence', 'status', 'aiModel'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['recommendation', 'trend_analysis', 'audience_insight', 'content_optimization', 'schedule_suggestion'], required: true },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'confidence', label: 'Confidence', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['new', 'reviewed', 'implemented', 'dismissed'] },
    ],
    detailFields: ['title', 'type', 'summary', 'confidence', 'status', 'aiModel', 'details'],
    ai: 'insight',
  },
  search: {
    columns: ['title', 'type', 'genre', 'rating', 'viewCount'],
    fields: [],
    detailFields: ['title', 'description', 'type', 'genre', 'duration', 'rating', 'status', 'viewCount'],
    ai: 'search',
    isSearch: true,
  },
  'ai-insights-dashboard': {
    columns: ['title', 'type', 'confidence', 'status', 'aiModel', 'createdAt'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['recommendation', 'trend_analysis', 'audience_insight', 'content_optimization', 'schedule_suggestion'], required: true },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'confidence', label: 'Confidence', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['new', 'reviewed', 'implemented', 'dismissed'] },
    ],
    detailFields: ['title', 'type', 'summary', 'confidence', 'status', 'aiModel', 'details'],
    ai: 'insight',
  },
};

function formatValue(val, key) {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (val === 'true') return 'Yes';
  if (val === 'false') return 'No';
  if (key?.includes('Time') || key === 'watchedAt' || key === 'addedAt') {
    try { return new Date(val).toLocaleString(); } catch { return val; }
  }
  if (key === 'viewCount' || key === 'viewsToday' || key === 'viewsWeek' || key === 'viewerCount') {
    return Number(val).toLocaleString();
  }
  if (key === 'rating' || key === 'score' || key === 'trendScore' || key === 'confidence' || key === 'growthRate') {
    return Number(val).toFixed(1);
  }
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function getStatusBadge(val) {
  const v = String(val).toLowerCase();
  const map = {
    active: 'badge-active', live: 'badge-live', completed: 'badge-completed',
    upcoming: 'badge-upcoming', scheduled: 'badge-scheduled', new: 'badge-new',
    archived: 'badge-archived', inactive: 'badge-inactive', dismissed: 'badge-dismissed',
    postponed: 'badge-postponed', cancelled: 'badge-cancelled', maintenance: 'badge-maintenance',
    airing: 'badge-airing', reviewed: 'badge-reviewed', implemented: 'badge-implemented',
  };
  return map[v] || '';
}

export default function FeaturePage({ feature, user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [notification, setNotification] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [enrichingId, setEnrichingId] = useState(null);
  const [computingTrending, setComputingTrending] = useState(false);

  const config = featureConfig[feature.key] || { columns: [], fields: [], detailFields: [] };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (config.isSearch) {
        setItems([]);
      } else {
        const resourceKey = feature.key === 'ai-insights-dashboard' ? 'insights' : feature.key;
        const response = await api.getAll(resourceKey, { page });
        // Handle both paginated and non-paginated responses
        if (response && response.data) {
          setItems(response.data);
          setPagination(response.pagination || null);
        } else if (Array.isArray(response)) {
          setItems(response);
          setPagination(null);
        } else {
          setItems([]);
        }
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
    setLoading(false);
  }, [feature.key, page]);

  useEffect(() => {
    loadData();
    setSelectedItem(null);
    setShowForm(false);
    setAiData(null);
    setSearchQuery('');
  }, [feature.key, page, loadData]);

  const handleRowClick = async (item) => {
    try {
      if (!config.isSearch) {
        const full = await api.getOne(feature.key, item.id);
        setSelectedItem(full);
      } else {
        setSelectedItem(item);
      }
    } catch {
      setSelectedItem(item);
    }
  };

  const handleNew = () => {
    setEditItem(null);
    setFormData({});
    setShowForm(true);
  };

  const handleEdit = () => {
    setEditItem(selectedItem);
    const data = {};
    config.fields.forEach(f => {
      let val = selectedItem[f.key];
      if (f.type === 'datetime-local' && val) {
        val = new Date(val).toISOString().slice(0, 16);
      }
      data[f.key] = val !== undefined && val !== null ? String(val) : '';
    });
    setFormData(data);
    setShowForm(true);
    setSelectedItem(null);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await api.delete(feature.key, selectedItem.id);
      showNotification('Deleted successfully');
      setSelectedItem(null);
      loadData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      // Convert types
      config.fields.forEach(f => {
        if (f.type === 'number' && payload[f.key]) payload[f.key] = Number(payload[f.key]);
        if (f.type === 'select' && (payload[f.key] === 'true' || payload[f.key] === 'false')) {
          payload[f.key] = payload[f.key] === 'true';
        }
      });

      if (editItem) {
        await api.update(feature.key, editItem.id, payload);
        showNotification('Updated successfully');
      } else {
        await api.create(feature.key, payload);
        showNotification('Created successfully');
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleAI = async () => {
    setAiLoading(true);
    try {
      let result;
      if (feature.key === 'recommendations') {
        result = await api.aiRecommend(user?.id || 1);
        loadData();
      } else if (feature.key === 'trending') {
        result = await api.aiTrendPredict();
      } else if (feature.key === 'analytics') {
        result = await api.aiAnalyze();
      } else if (feature.key === 'insights' || feature.key === 'ai-insights-dashboard') {
        result = await api.aiInsight('content_optimization');
        loadData();
      } else if (feature.key === 'search') {
        if (!searchQuery.trim()) {
          showNotification('Please enter a search query', 'error');
          setAiLoading(false);
          return;
        }
        result = await api.aiSearch(searchQuery);
        if (result.content) setItems(result.content);
      }
      setAiData(result?.ai || null);
    } catch (err) {
      showNotification(err.message, 'error');
    }
    setAiLoading(false);
  };

  const handleComputeTrending = async () => {
    setComputingTrending(true);
    try {
      const data = await api.computeTrending();
      showNotification(`Trending computed: ${data.updates?.length || 0} items updated`);
      loadData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
    setComputingTrending(false);
  };

  const handleEnrichContent = async (id) => {
    setEnrichingId(id);
    try {
      const data = await api.enrichContent(id);
      showNotification(`Content enriched with AI metadata`);
      loadData();
      if (data.ai) setAiData(data.ai);
    } catch (err) {
      showNotification(err.message, 'error');
    }
    setEnrichingId(null);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const results = await api.search(searchQuery);
      setItems(results);
    } catch (err) {
      showNotification(err.message, 'error');
    }
    setLoading(false);
  };

  const getDisplayTitle = (item) => {
    return item.title || item.name || item.displayName || item.metric || `#${item.id}`;
  };

  const getContentName = (item) => {
    return item.content?.title || `Content #${item.contentId}`;
  };

  return (
    <div>
      {notification && (
        <div className={`notification ${notification.type}`}>{notification.msg}</div>
      )}

      <div className="page-header">
        <div className="page-title">
          <div className="page-title-icon" style={{ background: feature.color }}>
            <span className="material-icons-round">{feature.icon}</span>
          </div>
          <div>
            <h1>{feature.label}</h1>
            <p>{pagination ? `${pagination.total} total items` : `${items.length} items`}</p>
          </div>
        </div>
        <div className="page-actions">
          {feature.key === 'trending' && (
            <button className="btn btn-secondary" onClick={handleComputeTrending} disabled={computingTrending}>
              <span className="material-icons-round">calculate</span>
              {computingTrending ? 'Computing...' : 'Compute Trending'}
            </button>
          )}
          {config.ai && (
            <button className="btn btn-ai" onClick={handleAI} disabled={aiLoading}>
              <span className="material-icons-round">auto_awesome</span>
              {feature.key === 'search' ? 'AI Search' :
               feature.key === 'recommendations' ? 'Generate Recommendations' :
               feature.key === 'trending' ? 'Predict Trends' :
               feature.key === 'analytics' ? 'AI Analyze' :
               feature.key === 'insights' ? 'Generate Insight' : 'AI'}
            </button>
          )}
          {!config.isSearch && (
            <button className="btn btn-primary" onClick={handleNew}>
              <span className="material-icons-round">add</span>
              New {feature.label.replace('AI ', '').split(' ')[0]}
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {config.isSearch && (
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search content... (e.g., 'football drama', 'nature documentary')"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-secondary" onClick={handleSearch}>
              <span className="material-icons-round">search</span> Search
            </button>
          </div>
        </div>
      )}

      {/* AI Output */}
      <AIOutput data={aiData} loading={aiLoading} />

      {/* Data Table */}
      {loading ? (
        <div className="loading"><div className="spinner"></div> Loading...</div>
      ) : items.length === 0 && !config.isSearch ? (
        <div className="empty-state">
          <span className="material-icons-round">inbox</span>
          <p>No items found</p>
        </div>
      ) : items.length > 0 ? (
        <div className="data-table-container" style={{ marginTop: 16 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                {config.columns.map(col => (
                  <th key={col}>{col.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} onClick={() => handleRowClick(item)}>
                  <td style={{ color: 'var(--text-muted)', width: 40 }}>{((page - 1) * 20) + idx + 1}</td>
                  {config.columns.map(col => (
                    <td key={col}>
                      {(col === 'status' || col === 'isActive' || col === 'isLive' || col === 'completed' || col === 'verified') ? (
                        <span className={`badge ${getStatusBadge(item[col])}`}>
                          {formatValue(item[col], col)}
                        </span>
                      ) : col === 'contentId' && config.showContentName ? (
                        getContentName(item)
                      ) : (
                        formatValue(item[col], col)
                      )}
                    </td>
                  ))}
                  {feature.key === 'content' && (
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-ai btn-sm"
                        style={{ fontSize: 11, padding: '4px 8px' }}
                        onClick={() => handleEnrichContent(item.id)}
                        disabled={enrichingId === item.id}
                      >
                        {enrichingId === item.id ? '...' : 'Enrich'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, padding: '16px', justifyContent: 'center', alignItems: 'center' }}>
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>&#8592; Prev</button>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Page {page} of {pagination.totalPages}</span>
              <button className="btn btn-secondary btn-sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next &#8594;</button>
            </div>
          )}
        </div>
      ) : config.isSearch ? (
        <div className="empty-state">
          <span className="material-icons-round">search</span>
          <p>Enter a search query to find content</p>
        </div>
      ) : null}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{getDisplayTitle(selectedItem)}</h2>
              <button className="modal-close" onClick={() => setSelectedItem(null)}>
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                {config.detailFields.map(key => (
                  <div key={key} className={`detail-item ${(key === 'description' || key === 'review' || key === 'summary' || key === 'reason' || key === 'details' || key === 'notes') ? 'detail-full' : ''}`}>
                    <label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
                    {(key === 'tags' || key === 'favoriteGenres' || key === 'favoriteTeams') && Array.isArray(selectedItem[key]) ? (
                      <div className="tags-container">
                        {selectedItem[key].map(t => <span key={t} className="tag">{t}</span>)}
                      </div>
                    ) : key === 'details' && typeof selectedItem[key] === 'object' ? (
                      <AIOutput data={selectedItem[key]} />
                    ) : (
                      <span>{formatValue(selectedItem[key], key)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              {!config.isSearch && (
                <>
                  <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                    <span className="material-icons-round">delete</span> Delete
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={handleEdit}>
                    <span className="material-icons-round">edit</span> Edit
                  </button>
                </>
              )}
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? 'Edit' : 'New'} {feature.label.replace('AI ', '').split(' ')[0]}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  {config.fields.map(field => (
                    <div key={field.key} className={`form-group ${field.type === 'textarea' ? 'form-full' : ''}`}>
                      <label>{field.label} {field.required && '*'}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={formData[field.key] || ''}
                          onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                          required={field.required}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={formData[field.key] || ''}
                          onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                          required={field.required}
                        >
                          <option value="">Select...</option>
                          {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt.replace(/_/g, ' ').replace(/^./, s => s.toUpperCase())}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.key] || ''}
                          onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                          required={field.required}
                          step={field.type === 'number' ? '0.1' : undefined}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <span className="material-icons-round">save</span> {editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
