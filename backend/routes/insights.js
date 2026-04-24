const express = require('express');
const { AIInsight, Content, Analytics } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { callOpenRouter } = require('../middleware/openrouter');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await AIInsight.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
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

// AI Generate Insight
router.post('/ai-generate', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body;
    const content = await Content.findAll({ limit: 20 });
    const analytics = await Analytics.findAll({ limit: 30 });

    const prompts = {
      content_optimization: 'Analyze our content catalog and suggest optimizations for better viewer engagement.',
      audience_insight: 'Analyze audience data and provide insights about viewer behavior patterns.',
      schedule_suggestion: 'Suggest schedule optimizations to maximize viewership across our channels.',
      trend_analysis: 'Analyze current content trends and predict what content types will grow.',
      recommendation: 'Provide strategic recommendations for content acquisition and production.'
    };

    const result = await callOpenRouter([
      { role: 'system', content: 'You are a strategic AI advisor for a major broadcaster. Provide deep, actionable insights. Return a JSON object with: title (string), sections (array of {heading, items}), and summary (string). Items should have contextually appropriate fields.' },
      { role: 'user', content: `${prompts[type] || prompts.recommendation}\n\nContent catalog: ${JSON.stringify(content.map(c => ({ title: c.title, type: c.type, genre: c.genre, rating: c.rating, viewCount: c.viewCount })))}\n\nAnalytics: ${JSON.stringify(analytics.map(a => ({ metric: a.metric, value: a.value, date: a.date })))}` }
    ]);

    let aiData = result.data;
    if (result.success && typeof aiData === 'string') {
      try { aiData = JSON.parse(aiData); } catch (e) { aiData = { title: 'AI Insight', sections: [{ heading: 'Analysis', items: [{ point: aiData }] }], summary: aiData }; }
    }
    if (result.mock) aiData = result.data;

    // Save insight
    const insight = await AIInsight.create({
      title: aiData.title || `AI ${type || 'General'} Insight`,
      type: type || 'recommendation',
      summary: aiData.summary || '',
      details: aiData,
      confidence: 0.85,
      aiModel: process.env.OPENROUTER_MODEL,
      aiResponse: aiData
    });

    res.json({ ai: aiData, insight });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
