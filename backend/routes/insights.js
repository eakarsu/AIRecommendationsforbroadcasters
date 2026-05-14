const express = require('express');
const { AIInsight, Content, Analytics } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { callOpenRouter, aiRateLimiter } = require('../middleware/openrouter');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await AIInsight.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit, offset
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await AIInsight.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const item = await AIInsight.create(req.body);
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await AIInsight.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await AIInsight.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Generate Insight — always persists to AIInsight table
router.post('/ai-generate', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { type } = req.body;
    const [content, analytics] = await Promise.all([
      Content.findAll({ limit: 20 }),
      Analytics.findAll({ limit: 30 })
    ]);

    const prompts = {
      content_optimization: 'Analyze our content catalog and suggest optimizations for better viewer engagement.',
      audience_insight: 'Analyze audience data and provide insights about viewer behavior patterns.',
      schedule_suggestion: 'Suggest schedule optimizations to maximize viewership across our channels.',
      trend_analysis: 'Analyze current content trends and predict what content types will grow.',
      recommendation: 'Provide strategic recommendations for content acquisition and production.'
    };

    const validTypes = ['recommendation', 'trend_analysis', 'audience_insight', 'content_optimization', 'schedule_suggestion'];
    const insightType = validTypes.includes(type) ? type : 'recommendation';

    const result = await callOpenRouter([
      { role: 'system', content: 'You are a strategic AI advisor for a major broadcaster. Provide deep, actionable insights. Return a JSON object with: title (string), sections (array of {heading, items}), and summary (string). Items should have contextually appropriate fields.' },
      { role: 'user', content: `${prompts[insightType] || prompts.recommendation}\n\nContent catalog: ${JSON.stringify(content.map(c => ({ title: c.title, type: c.type, genre: c.genre, rating: c.rating, viewCount: c.viewCount })))}\n\nAnalytics: ${JSON.stringify(analytics.map(a => ({ metric: a.metric, value: a.value, date: a.date })))}` }
    ], { maxTokens: 2048, json: true });

    let aiData = result.data;
    if (result.mock) aiData = result.data;

    // Persist to AIInsight table
    const insight = await AIInsight.create({
      title: aiData?.title || `AI ${insightType} Insight`,
      type: insightType,
      summary: aiData?.summary || '',
      details: aiData || {},
      confidence: 0.85,
      aiModel: result.model || process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      aiResponse: aiData || {}
    });

    res.json({ ai: aiData, insight });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
