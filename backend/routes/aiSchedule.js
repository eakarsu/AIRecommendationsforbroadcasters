const express = require('express');
const { Schedule, ViewingHistory, Content, Channel, AIInsight } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { callOpenRouter, aiRateLimiter } = require('../middleware/openrouter');
const { Op, fn, col } = require('sequelize');
const router = express.Router();

// POST /api/ai/optimize-schedule
router.post('/optimize-schedule', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const now = new Date();
    const day7 = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [schedules, topViewed] = await Promise.all([
      Schedule.findAll({
        include: [
          { model: Content, as: 'content', attributes: ['id', 'title', 'type', 'genre', 'rating'] },
          { model: Channel, as: 'channel', attributes: ['id', 'name'] }
        ],
        order: [['startTime', 'ASC']],
        limit: 50
      }),
      ViewingHistory.findAll({
        where: { watchedAt: { [Op.gte]: day7 } },
        attributes: ['contentId', [fn('COUNT', col('id')), 'views'], [fn('AVG', col('progress')), 'avgProgress']],
        group: ['contentId'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        limit: 20,
        raw: true
      })
    ]);

    const scheduleData = schedules.map(s => ({
      title: s.title,
      channel: s.channel?.name,
      startTime: s.startTime,
      isPrimetime: s.isPrimetime,
      isRepeat: s.isRepeat,
      status: s.status,
      contentType: s.content?.type,
      genre: s.content?.genre
    }));

    const viewingData = topViewed.map(v => ({
      contentId: v.contentId,
      views: parseInt(v.views),
      avgProgress: parseFloat(v.avgProgress || 0).toFixed(1)
    }));

    const result = await callOpenRouter([
      { role: 'system', content: 'You are a broadcast schedule optimization AI. Analyze the current schedule and viewing patterns, then recommend specific improvements. Return a JSON object with: title (string), sections (array of {heading, items}), and summary (string). Each item should have: slot, current, suggested, lift (predicted improvement), reason.' },
      { role: 'user', content: `Optimize our broadcast schedule:\n\nCurrent Schedule (${scheduleData.length} slots):\n${JSON.stringify(scheduleData)}\n\nTop Viewed Content Last 7 Days:\n${JSON.stringify(viewingData)}\n\nProvide specific scheduling recommendations with predicted viewership lift.` }
    ], { maxTokens: 2048, json: true });

    let aiData = result.data;
    if (result.mock) aiData = result.data;

    // Persist AIInsight
    const insight = await AIInsight.create({
      title: aiData?.title || 'Schedule Optimization',
      type: 'schedule_suggestion',
      summary: aiData?.summary || '',
      details: aiData || {},
      confidence: 0.80,
      aiModel: result.model || process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      aiResponse: aiData || {}
    });

    res.json({ ai: aiData, insight, scheduleCount: schedules.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/recommend (personalized content recommendations)
router.post('/recommend', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { profileId, limit = 10, mood, recentlyWatched } = req.body || {};
    const recent = await ViewingHistory.findAll({
      where: profileId ? { profileId } : {},
      order: [['watchedAt', 'DESC']],
      limit: 20,
      include: [{ model: Content, as: 'content', attributes: ['id', 'title', 'genre', 'type', 'rating'] }]
    });
    const candidates = await Content.findAll({ limit: 50, order: [['rating', 'DESC']], attributes: ['id', 'title', 'genre', 'type', 'rating'] });

    const recentLite = recent.map(r => ({ title: r.content?.title, genre: r.content?.genre, type: r.content?.type, progress: r.progress }));
    const candLite = candidates.map(c => ({ id: c.id, title: c.title, genre: c.genre, type: c.type, rating: c.rating }));

    const result = await callOpenRouter([
      { role: 'system', content: 'You are a content recommendation AI. Score candidates against the viewer\'s tastes and return JSON: {recommendations:[{contentId,title,score,reason}], rationale, mood_match}.' },
      { role: 'user', content: `Profile: ${profileId || 'guest'}\nMood: ${mood || 'unspecified'}\nRecent viewing:\n${JSON.stringify(recentLite)}\n\nRecently provided: ${JSON.stringify(recentlyWatched || [])}\n\nCandidates:\n${JSON.stringify(candLite)}\n\nReturn the top ${limit} personalised recommendations.` }
    ], { maxTokens: 2048, json: true });

    res.json({ ai: result.data, candidatesConsidered: candLite.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/trend-detector (emerging content trends)
router.post('/trend-detector', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const trending = await ViewingHistory.findAll({
      where: { watchedAt: { [Op.gte]: since } },
      attributes: ['contentId', [fn('COUNT', col('id')), 'views']],
      group: ['contentId'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 50,
      raw: true
    });

    const enriched = await Promise.all(trending.map(async t => {
      const c = await Content.findByPk(t.contentId, { attributes: ['title', 'genre', 'type'] });
      return { contentId: t.contentId, title: c?.title, genre: c?.genre, type: c?.type, views: parseInt(t.views) };
    }));

    const result = await callOpenRouter([
      { role: 'system', content: 'You are a content trend analysis AI. Identify emerging trends, fading content, and cross-genre patterns. Return JSON: {emerging_trends:[{theme,evidence,confidence}], fading:[], surge:[], cross_genre_patterns:[], recommendations:[]}.' },
      { role: 'user', content: `Recent 14-day viewership:\n${JSON.stringify(enriched)}\n\nDetect emerging trends and predict near-term shifts.` }
    ], { maxTokens: 2048, json: true });

    res.json({ ai: result.data, sample_size: enriched.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/audience-segmentation (cluster viewers by taste)
router.post('/audience-segmentation', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const watch = await ViewingHistory.findAll({
      where: { watchedAt: { [Op.gte]: since } },
      attributes: ['profileId', 'contentId', 'progress', 'watchedAt'],
      limit: 1000,
      include: [{ model: Content, as: 'content', attributes: ['title', 'genre', 'type'] }]
    });

    const byProfile = {};
    for (const w of watch) {
      const pid = w.profileId || 'guest';
      if (!byProfile[pid]) byProfile[pid] = { profileId: pid, genres: {}, types: {}, watches: 0 };
      byProfile[pid].watches += 1;
      if (w.content?.genre) byProfile[pid].genres[w.content.genre] = (byProfile[pid].genres[w.content.genre] || 0) + 1;
      if (w.content?.type) byProfile[pid].types[w.content.type] = (byProfile[pid].types[w.content.type] || 0) + 1;
    }

    const profiles = Object.values(byProfile).slice(0, 100);

    const result = await callOpenRouter([
      { role: 'system', content: 'You are an audience-segmentation AI. Cluster profiles by taste. Return JSON: {segments:[{name,size,top_genres,top_types,exemplar_profile_ids,programming_advice}], summary}.' },
      { role: 'user', content: `Profile-level watch features:\n${JSON.stringify(profiles)}\n\nCluster into 4-7 meaningful segments.` }
    ], { maxTokens: 2048, json: true });

    res.json({ ai: result.data, profilesAnalyzed: profiles.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Apply pass 4: 503-on-no-key guard (force 503 even outside NODE_ENV=production).
function requireAiKey(req, res) {
  const k = process.env.OPENROUTER_API_KEY;
  if (!k || k === 'your-openrouter-key-here' || k === 'your_openrouter_api_key_here') {
    res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY is not configured.' });
    return false;
  }
  return true;
}

// POST /api/ai/churn-prediction — apply pass 4
router.post('/churn-prediction', authenticateToken, aiRateLimiter, async (req, res) => {
  if (!requireAiKey(req, res)) return;
  try {
    const { window_days = 30 } = req.body || {};
    const days = Math.min(180, Math.max(7, parseInt(window_days) || 30));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const watch = await ViewingHistory.findAll({
      where: { watchedAt: { [Op.gte]: since } },
      attributes: ['profileId', 'contentId', 'progress', 'watchedAt'],
      limit: 2000,
      include: [{ model: Content, as: 'content', attributes: ['title', 'genre', 'type'] }]
    });

    const byProfile = {};
    const cutoffActive = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    for (const w of watch) {
      const pid = w.profileId || 'guest';
      if (!byProfile[pid]) byProfile[pid] = { profileId: pid, watches: 0, last_watched: null, avg_progress: 0, _progSum: 0, genres: {} };
      const p = byProfile[pid];
      p.watches += 1;
      p._progSum += Number(w.progress || 0);
      if (!p.last_watched || new Date(w.watchedAt) > new Date(p.last_watched)) p.last_watched = w.watchedAt;
      if (w.content?.genre) p.genres[w.content.genre] = (p.genres[w.content.genre] || 0) + 1;
    }
    const profiles = Object.values(byProfile).map(p => ({
      profileId: p.profileId,
      watches: p.watches,
      last_watched: p.last_watched,
      days_since_last_watch: p.last_watched ? Math.round((Date.now() - new Date(p.last_watched)) / 86400000) : null,
      avg_progress: p.watches ? +(p._progSum / p.watches).toFixed(2) : 0,
      top_genres: Object.entries(p.genres).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g]) => g),
      recently_active: p.last_watched && new Date(p.last_watched) >= cutoffActive
    })).slice(0, 200);

    const result = await callOpenRouter([
      { role: 'system', content: 'You are a viewer churn-prediction AI. Score each profile 0-1 for churn risk. Return JSON: {at_risk:[{profileId,score,reasons:[],recommended_intervention}], cohort_summary:{high:0,medium:0,low:0}, top_signals:[], retention_playbook:[]}.' },
      { role: 'user', content: `Window: last ${days} days.\n\nProfile features:\n${JSON.stringify(profiles)}\n\nIdentify churn-risk viewers and recommend interventions.` }
    ], { maxTokens: 2048, json: true });

    res.json({ ai: result.data, profiles_analysed: profiles.length, window_days: days });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
