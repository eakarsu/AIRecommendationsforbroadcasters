const express = require('express');
const { Analytics, ViewingHistory, Content, AIInsight } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { callOpenRouter, aiRateLimiter } = require('../middleware/openrouter');
const { fn, col, Op } = require('sequelize');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await Analytics.findAndCountAll({
      order: [['date', 'DESC']],
      limit, offset
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Analytics.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const item = await Analytics.create(req.body);
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Analytics.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Analytics.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/analytics/completion-rates — aggregate completion rates from ViewingHistory
router.get('/completion-rates', authenticateToken, async (req, res) => {
  try {
    const rows = await ViewingHistory.findAll({
      include: [{ model: Content, as: 'content', attributes: ['id', 'title', 'type'] }],
      attributes: [
        'contentId',
        [fn('COUNT', col('ViewingHistory.id')), 'totalViews'],
        [fn('SUM', col('completed')), 'completedViews'],
        [fn('AVG', col('progress')), 'avgProgress']
      ],
      group: ['contentId', 'content.id'],
      raw: false
    });

    const data = rows.map(r => ({
      contentId: r.contentId,
      title: r.content?.title,
      type: r.content?.type,
      totalViews: parseInt(r.getDataValue('totalViews')),
      completedViews: parseInt(r.getDataValue('completedViews') || 0),
      completionRate: parseFloat(
        (parseInt(r.getDataValue('completedViews') || 0) / parseInt(r.getDataValue('totalViews'))) * 100
      ).toFixed(1),
      avgProgress: parseFloat(r.getDataValue('avgProgress') || 0).toFixed(1)
    })).sort((a, b) => parseFloat(b.completionRate) - parseFloat(a.completionRate));

    res.json({ data, summary: { totalContent: data.length, avgCompletionRate: (data.reduce((s, r) => s + parseFloat(r.completionRate), 0) / Math.max(data.length, 1)).toFixed(1) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/analytics/watch-time — aggregate watch time from ViewingHistory
router.get('/watch-time', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await ViewingHistory.findAll({
      where: { watchedAt: { [Op.gte]: since } },
      include: [{ model: Content, as: 'content', attributes: ['id', 'title', 'type', 'genre'] }],
      attributes: [
        'contentId',
        [fn('SUM', col('duration')), 'totalMinutes'],
        [fn('COUNT', col('ViewingHistory.id')), 'sessions'],
        [fn('AVG', col('duration')), 'avgSession']
      ],
      group: ['contentId', 'content.id'],
      raw: false
    });

    const data = rows.map(r => ({
      contentId: r.contentId,
      title: r.content?.title,
      type: r.content?.type,
      genre: r.content?.genre,
      totalMinutes: parseInt(r.getDataValue('totalMinutes') || 0),
      totalHours: (parseInt(r.getDataValue('totalMinutes') || 0) / 60).toFixed(1),
      sessions: parseInt(r.getDataValue('sessions')),
      avgSessionMin: parseFloat(r.getDataValue('avgSession') || 0).toFixed(1)
    })).sort((a, b) => b.totalMinutes - a.totalMinutes);

    const totalHours = data.reduce((s, r) => s + r.totalMinutes, 0) / 60;

    res.json({
      data,
      summary: {
        period: `${days} days`,
        totalHours: totalHours.toFixed(1),
        totalSessions: data.reduce((s, r) => s + r.sessions, 0),
        topContent: data[0]?.title || 'N/A'
      }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Analytics
router.post('/ai-analyze', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const analytics = await Analytics.findAll({ order: [['date', 'DESC']], limit: 50 });
    const result = await callOpenRouter([
      { role: 'system', content: 'You are a media analytics AI for a major broadcaster. Analyze audience data and provide actionable insights. Return a JSON object with: title (string), sections (array of {heading, items}), and summary (string). Each item should have fields like metric, value, trend, detail or action, impact, reason.' },
      { role: 'user', content: `Analyze this audience analytics data and provide insights: ${JSON.stringify(analytics.map(a => ({ metric: a.metric, value: a.value, date: a.date, region: a.region, demographic: a.demographic })))}` }
    ], { maxTokens: 2048, json: true });

    let aiData = result.data;
    if (result.mock) aiData = result.data;

    // Persist AIInsight
    await AIInsight.create({
      title: aiData?.title || 'Analytics Insights',
      type: 'audience_insight',
      summary: aiData?.summary || '',
      details: aiData || {},
      confidence: 0.82,
      aiModel: result.model || process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      aiResponse: aiData || {}
    });

    res.json({ ai: aiData, analytics });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
