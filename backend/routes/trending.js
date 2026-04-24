const express = require('express');
const { Trending, Content } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { callOpenRouter } = require('../middleware/openrouter');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await Trending.findAll({
      include: [{ model: Content, as: 'content' }],
      order: [['trendScore', 'DESC']]
    });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Trending.findByPk(req.params.id, {
      include: [{ model: Content, as: 'content' }]
    });
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

// AI Trend Prediction
router.post('/ai-predict', authenticateToken, async (req, res) => {
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
    ]);

    let aiData = result.data;
    if (result.success && typeof aiData === 'string') {
      try { aiData = JSON.parse(aiData); } catch (e) { aiData = { title: 'Trend Analysis', sections: [{ heading: 'AI Analysis', items: [{ point: aiData }] }], summary: aiData }; }
    }
    if (result.mock) aiData = result.data;

    res.json({ ai: aiData, trends });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
