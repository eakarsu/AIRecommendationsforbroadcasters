const express = require('express');
const { Recommendation, User, Content, ViewingHistory, UserProfile, AIInsight } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { callOpenRouter, aiRateLimiter } = require('../middleware/openrouter');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Recommendation.findAndCountAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Content, as: 'content' }
      ],
      order: [['score', 'DESC']],
      limit, offset
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
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

// AI Generate Recommendations — inserts into Recommendation table + AIInsight
router.post('/ai-generate', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    if (req.rateLimitExceeded) return res.status(503).json({ error: 'AI service unavailable' });
    const userId = req.body.userId || req.user.id;

    const [history, profile, allContent] = await Promise.all([
      ViewingHistory.findAll({ where: { userId }, include: [{ model: Content, as: 'content' }], limit: 20 }),
      UserProfile.findOne({ where: { userId } }),
      Content.findAll({ where: { status: 'active' }, limit: 50 })
    ]);

    const result = await callOpenRouter([
      { role: 'system', content: 'You are a content recommendation AI for a major broadcaster. Generate personalized recommendations. Return a JSON object with: title (string), sections (array of {heading, items}), and summary (string). Each item must have: contentTitle (string), confidence (number 0-100), reason (string).' },
      { role: 'user', content: `Generate personalized content recommendations based on:\n\nUser Profile: ${JSON.stringify(profile || {})}\n\nViewing History: ${JSON.stringify(history.map(h => h.content?.title))}\n\nAvailable Content: ${JSON.stringify(allContent.map(c => ({ id: c.id, title: c.title, type: c.type, genre: c.genre, rating: c.rating })))}` }
    ], { maxTokens: 2048, json: true });

    let aiData = result.data;
    if (result.mock) aiData = result.data;

    // Persist AIInsight
    const insight = await AIInsight.create({
      title: aiData?.title || 'AI Recommendations',
      type: 'recommendation',
      summary: aiData?.summary || '',
      details: aiData || {},
      confidence: 0.85,
      aiModel: result.model || process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      aiResponse: aiData || {}
    });

    // Insert recommendations into Recommendation table
    const createdRecs = [];
    if (aiData?.sections) {
      for (const section of aiData.sections) {
        for (const item of (section.items || [])) {
          const matchedContent = allContent.find(c =>
            c.title.toLowerCase().includes((item.contentTitle || item.name || '').toLowerCase()) ||
            (item.contentTitle || item.name || '').toLowerCase().includes(c.title.toLowerCase())
          );
          if (matchedContent) {
            const rec = await Recommendation.create({
              userId,
              contentId: matchedContent.id,
              reason: item.reason || section.heading,
              score: (item.confidence || 75) / 100,
              algorithm: 'ai_personalized',
              status: 'active',
              aiResponse: item
            }).catch(() => null);
            if (rec) createdRecs.push(rec);
          }
        }
      }
    }

    res.json({ ai: aiData, insight, recommendationsCreated: createdRecs.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
