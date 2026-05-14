const API = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Auth
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),

  // Generic CRUD with pagination
  getAll: (resource, params = {}) => {
    const qs = new URLSearchParams({ page: 1, limit: 20, ...params }).toString();
    return request(`/${resource}?${qs}`);
  },
  getOne: (resource, id) => request(`/${resource}/${id}`),
  create: (resource, data) => request(`/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (resource, id, data) => request(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (resource, id) => request(`/${resource}/${id}`, { method: 'DELETE' }),

  // Search
  search: (q) => request(`/search?q=${encodeURIComponent(q)}`),
  aiSearch: (query) => request('/search/ai-search', { method: 'POST', body: JSON.stringify({ query }) }),

  // AI Features
  aiRecommend: (userId) => request('/recommendations/ai-generate', { method: 'POST', body: JSON.stringify({ userId }) }),
  aiTrendPredict: () => request('/trending/ai-predict', { method: 'POST', body: JSON.stringify({}) }),
  aiAnalyze: () => request('/analytics/ai-analyze', { method: 'POST', body: JSON.stringify({}) }),
  aiInsight: (type) => request('/insights/ai-generate', { method: 'POST', body: JSON.stringify({ type }) }),

  // New endpoints
  computeTrending: () => request('/trending/compute'),
  enrichContent: (id) => request(`/content/${id}/enrich`, { method: 'POST', body: JSON.stringify({}) }),
  optimizeSchedule: () => request('/ai/optimize-schedule', { method: 'POST', body: JSON.stringify({}) }),
  getCompletionRates: () => request('/analytics/completion-rates'),
  getWatchTime: (days = 30) => request(`/analytics/watch-time?days=${days}`),
};
