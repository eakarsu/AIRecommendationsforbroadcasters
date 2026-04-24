const express = require('express');
const { Playlist, PlaylistItem, Content } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await Playlist.findAll({
      include: [{ model: PlaylistItem, as: 'items', include: [{ model: Content, as: 'content' }] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Playlist.findByPk(req.params.id, {
      include: [{ model: PlaylistItem, as: 'items', include: [{ model: Content, as: 'content' }] }]
    });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const item = await Playlist.create(req.body);
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Playlist.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Playlist.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await PlaylistItem.destroy({ where: { playlistId: item.id } });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
