const express = require('express');
const { Content, Category, AIInsight } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { callOpenRouter, aiRateLimiter } = require('../middleware/openrouter');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await Content.findAndCountAll({
      include: [{ model: Category, as: 'category' }],
      order: [['createdAt', 'DESC']],
      limit, offset
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Content.findByPk(req.params.id, { include: [{ model: Category, as: 'category' }] });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const item = await Content.create(req.body);
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Content.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Content.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Content Enrichment: AI returns genre tags, target audience, content advisory rating
router.post('/:id/enrich', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const item = await Content.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Content not found' });

    const result = await callOpenRouter([
      { role: 'system', content: 'You are a content metadata enrichment AI for a broadcaster. Analyze content and return enriched metadata. Return a JSON object with: genreTags (array of strings), targetAudience (string), contentAdvisory (string like TV-G/TV-PG/TV-14/TV-MA), ageRange (string), themes (array), mood (string), similarContent (array of titles), summary (string).' },
      { role: 'user', content: `Enrich this broadcast content with metadata:\n\nTitle: ${item.title}\nType: ${item.type}\nGenre: ${item.genre || 'Unknown'}\nDescription: ${item.description || 'No description'}\nRating: ${item.rating}\nLanguage: ${item.language}` }
    ], { maxTokens: 1024, json: true });

    let enrichment = result.data;
    if (result.mock) enrichment = result.data;

    // Update content metadata
    const currentMeta = item.metadata || {};
    await item.update({
      metadata: { ...currentMeta, enrichment, enrichedAt: new Date().toISOString() },
      tags: enrichment?.genreTags || item.tags
    });

    // Persist AIInsight
    await AIInsight.create({
      title: `Content Enrichment: ${item.title}`,
      type: 'content_optimization',
      summary: enrichment?.summary || `Enriched metadata for ${item.title}`,
      details: enrichment || {},
      confidence: 0.88,
      aiModel: result.model || process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      aiResponse: enrichment || {}
    });

    res.json({ ai: enrichment, content: await item.reload() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
