const express = require('express');
const { Trending, Content, ViewingHistory, AIInsight } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { callOpenRouter, aiRateLimiter } = require('../middleware/openrouter');
const { Op, fn, col, literal } = require('sequelize');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await Trending.findAndCountAll({
      include: [{ model: Content, as: 'content' }],
      order: [['trendScore', 'DESC']],
      limit, offset
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Trending.findByPk(req.params.id, { include: [{ model: Content, as: 'content' }] });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const item = await Trending.create(req.body);
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Trending.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Trending.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Real Trending Compute: queries ViewingHistory last 7 days vs prior 7 days, computes delta, updates Trending
router.get('/compute', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const day7 = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const day14 = new Date(now - 14 * 24 * 60 * 60 * 1000);

    // Current week views
    const currentWeek = await ViewingHistory.findAll({
      where: { watchedAt: { [Op.gte]: day7 } },
      attributes: ['contentId', [fn('COUNT', col('id')), 'views']],
      group: ['contentId'],
      raw: true
    });

    // Prior week views
    const priorWeek = await ViewingHistory.findAll({
      where: { watchedAt: { [Op.between]: [day14, day7] } },
      attributes: ['contentId', [fn('COUNT', col('id')), 'views']],
      group: ['contentId'],
      raw: true
    });

    const priorMap = {};
    priorWeek.forEach(r => { priorMap[r.contentId] = parseInt(r.views); });

    // Compute deltas and update/create Trending records
    const updates = [];
    for (const row of currentWeek) {
      const contentId = row.contentId;
      const currentViews = parseInt(row.views);
      const priorViews = priorMap[contentId] || 0;
      const growthRate = priorViews > 0 ? ((currentViews - priorViews) / priorViews) * 100 : 100;
      const trendScore = currentViews * (1 + Math.max(0, growthRate) / 100);

      const [trendRecord, created] = await Trending.findOrCreate({
        where: { contentId },
        defaults: { contentId, viewsWeek: currentViews, viewsToday: 0, growthRate, trendScore, region: 'Global' }
      });

      if (!created) {
        await trendRecord.update({ viewsWeek: currentViews, growthRate, trendScore });
      }

      updates.push({ contentId, currentViews, priorViews, growthRate: growthRate.toFixed(1), trendScore: trendScore.toFixed(1) });
    }

    // Update ranks
    const allTrending = await Trending.findAll({ order: [['trendScore', 'DESC']] });
    for (let i = 0; i < allTrending.length; i++) {
      await allTrending[i].update({ rank: i + 1 });
    }

    res.json({ message: `Trending computed for ${updates.length} content items`, updates });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Trend Prediction
router.post('/ai-predict', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const trends = await Trending.findAll({
      include: [{ model: Content, as: 'content' }],
      order: [['trendScore', 'DESC']],
      limit: 10
    });
    const trendData = trends.map(t => ({
      title: t.content?.title,
      score: t.trendScore,
      views: t.viewsWeek,
      growth: t.growthRate
    }));

    const result = await callOpenRouter([
      { role: 'system', content: 'You are a media analytics AI. Analyze content trends for a major broadcaster. Return a JSON object with: title (string), sections (array of {heading, items}), and summary (string). Each item should have relevant fields like name, growth, prediction, confidence.' },
      { role: 'user', content: `Analyze these trending content items and predict future trends: ${JSON.stringify(trendData)}` }
    ], { maxTokens: 2048, json: true });

    let aiData = result.data;
    if (result.mock) aiData = result.data;

    // Persist AIInsight
    await AIInsight.create({
      title: aiData?.title || 'Trend Analysis',
      type: 'trend_analysis',
      summary: aiData?.summary || '',
      details: aiData || {},
      confidence: 0.80,
      aiModel: result.model || process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      aiResponse: aiData || {}
    });

    res.json({ ai: aiData, trends });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
