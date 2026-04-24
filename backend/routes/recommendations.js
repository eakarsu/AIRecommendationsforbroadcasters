const express = require('express');
const { Recommendation, User, Content, ViewingHistory, UserProfile } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { callOpenRouter } = require('../middleware/openrouter');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await Recommendation.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Content, as: 'content' }
      ],
      order: [['score', 'DESC']]
    });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Recommendation.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Content, as: 'content' }
      ]
    });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const item = await Recommendation.create(req.body);
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Recommendation.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Recommendation.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Generate Recommendations
router.post('/ai-generate', authenticateToken, async (req, res) => {
  try {
    const userId = req.body.userId || req.user.id;
    const history = await ViewingHistory.findAll({
      where: { userId },
      include: [{ model: Content, as: 'content' }],
      limit: 20
    });
    const profile = await UserProfile.findOne({ where: { userId } });
    const allContent = await Content.findAll({ limit: 30 });

    const result = await callOpenRouter([
      { role: 'system', content: 'You are a content recommendation AI for a major broadcaster with diverse content from live sports to soap operas. Generate personalized recommendations. Return a JSON object with: title (string), sections (array of {heading, items}), and summary (string). Each item should have: name, confidence (number 0-100), reason (string).' },
      { role: 'user', content: `Generate personalized content recommendations based on:\n\nUser Profile: ${JSON.stringify(profile || {})}\n\nViewing History: ${JSON.stringify(history.map(h => h.content?.title))}\n\nAvailable Content: ${JSON.stringify(allContent.map(c => ({ title: c.title, type: c.type, genre: c.genre, rating: c.rating })))}` }
    ]);

    let aiData = result.data;
    if (result.success && typeof aiData === 'string') {
      try { aiData = JSON.parse(aiData); } catch (e) { aiData = { title: 'Recommendations', sections: [{ heading: 'AI Recommendations', items: [{ point: aiData }] }], summary: aiData }; }
    }
    if (result.mock) aiData = result.data;

    res.json({ ai: aiData });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
