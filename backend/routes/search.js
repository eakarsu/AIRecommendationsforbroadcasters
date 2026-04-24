const express = require('express');
const { Content, Category } = require('../models');
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');
const { callOpenRouter } = require('../middleware/openrouter');
const router = express.Router();

// Standard search
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { q, type, genre } = req.query;
    const where = {};
    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } }
      ];
    }
    if (type) where.type = type;
    if (genre) where.genre = genre;

    const items = await Content.findAll({
      where,
      include: [{ model: Category, as: 'category' }],
      order: [['viewCount', 'DESC']],
      limit: 50
    });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI-powered search
router.post('/ai-search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.body;
    const content = await Content.findAll({ limit: 50 });

    const result = await callOpenRouter([
      { role: 'system', content: 'You are a content search AI for a major broadcaster. Given a natural language query, find and rank the most relevant content. Return a JSON object with: title (string), sections (array of {heading, items}), and summary (string). Each item should have: name, relevance (number 0-100), description (string).' },
      { role: 'user', content: `Search query: "${query}"\n\nAvailable content: ${JSON.stringify(content.map(c => ({ id: c.id, title: c.title, type: c.type, genre: c.genre, description: c.description, tags: c.tags })))}` }
    ]);

    let aiData = result.data;
    if (result.success && typeof aiData === 'string') {
      try { aiData = JSON.parse(aiData); } catch (e) { aiData = { title: 'Search Results', sections: [{ heading: 'Results', items: [{ point: aiData }] }], summary: aiData }; }
    }
    if (result.mock) aiData = result.data;

    res.json({ ai: aiData, content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
