const express = require('express');
const { Analytics } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { callOpenRouter } = require('../middleware/openrouter');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await Analytics.findAll({ order: [['date', 'DESC']] });
    res.json(items);
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

// AI Analytics
router.post('/ai-analyze', authenticateToken, async (req, res) => {
  try {
    const analytics = await Analytics.findAll({ order: [['date', 'DESC']], limit: 50 });
    const result = await callOpenRouter([
      { role: 'system', content: 'You are a media analytics AI for a major broadcaster. Analyze audience data and provide actionable insights. Return a JSON object with: title (string), sections (array of {heading, items}), and summary (string). Each item should have fields like metric, value, trend, detail or action, impact, reason.' },
      { role: 'user', content: `Analyze this audience analytics data and provide insights: ${JSON.stringify(analytics.map(a => ({ metric: a.metric, value: a.value, date: a.date, region: a.region, demographic: a.demographic })))}` }
    ]);

    let aiData = result.data;
    if (result.success && typeof aiData === 'string') {
      try { aiData = JSON.parse(aiData); } catch (e) { aiData = { title: 'Analytics Insights', sections: [{ heading: 'AI Analysis', items: [{ point: aiData }] }], summary: aiData }; }
    }
    if (result.mock) aiData = result.data;

    res.json({ ai: aiData, analytics });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
