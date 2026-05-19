// Custom Views - 4 endpoints for AIRecommendationsforbroadcasters
// VIZ: engagement chart + hit-rate heatmap
// NON-VIZ: programming brief PDF + recommendation rules editor (CRUD)
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');

// In-memory store for recommendation rules (segment x content weights, A/B groups)
const rulesStore = {
  nextId: 5,
  rules: [
    { id: 1, name: 'Sports Boost - Weekend', segment: 'sports_fans', contentType: 'live_sports', weight: 1.8, abGroup: 'A', active: true },
    { id: 2, name: 'Drama Prime Time', segment: 'drama_lovers', contentType: 'series', weight: 1.5, abGroup: 'A', active: true },
    { id: 3, name: 'News Morning Push', segment: 'news_watchers', contentType: 'news', weight: 2.0, abGroup: 'B', active: true },
    { id: 4, name: 'Kids Afternoon', segment: 'family', contentType: 'kids', weight: 1.3, abGroup: 'B', active: false },
  ],
};

// ---------------------------------------------------------------------------
// VIZ 1: GET /api/custom-views/engagement
// Content engagement chart (per content type, daily series)
// ---------------------------------------------------------------------------
router.get('/engagement', (req, res) => {
  const days = Math.min(parseInt(req.query.days, 10) || 7, 30);
  const contentTypes = ['live_sports', 'series', 'news', 'movies', 'kids'];
  const today = new Date();
  const series = contentTypes.map((type, idx) => {
    const base = 1200 + idx * 400;
    const points = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const noise = Math.round(Math.sin((i + idx) * 0.7) * 250 + Math.random() * 180);
      points.push({
        date: d.toISOString().slice(0, 10),
        viewers: Math.max(100, base + noise),
        completionRate: Math.round((60 + idx * 4 + Math.sin(i + idx) * 8) * 10) / 10,
      });
    }
    return { contentType: type, points };
  });

  res.json({
    ok: true,
    project: 'AIRecommendationsforbroadcasters',
    metric: 'engagement',
    rangeDays: days,
    generatedAt: new Date().toISOString(),
    series,
  });
});

// ---------------------------------------------------------------------------
// VIZ 2: GET /api/custom-views/hit-rate-heatmap
// Recommendation hit rate heatmap (audience segment x content type)
// ---------------------------------------------------------------------------
router.get('/hit-rate-heatmap', (req, res) => {
  const segments = ['sports_fans', 'drama_lovers', 'news_watchers', 'family', 'cinephiles', 'casual'];
  const contentTypes = ['live_sports', 'series', 'news', 'movies', 'kids', 'documentaries'];
  // deterministic-ish synthetic hit rates 0..1
  const matrix = segments.map((seg, i) =>
    contentTypes.map((ct, j) => {
      const affinity = (i === j) ? 0.85 : 0.25;
      const wobble = (Math.sin(i * 3 + j * 5) + 1) / 8; // 0..0.25
      const hit = Math.max(0.05, Math.min(0.99, affinity + wobble - 0.1));
      return Math.round(hit * 1000) / 1000;
    })
  );

  res.json({
    ok: true,
    project: 'AIRecommendationsforbroadcasters',
    metric: 'hit_rate',
    segments,
    contentTypes,
    matrix, // matrix[segmentIdx][contentTypeIdx]
    generatedAt: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// NON-VIZ 1: GET /api/custom-views/programming-brief
// Programming brief PDF download
// ---------------------------------------------------------------------------
router.get('/programming-brief', (req, res) => {
  try {
    const doc = new PDFDocument({ margin: 50, info: { Title: 'Programming Brief' } });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="programming_brief.pdf"');
    doc.pipe(res);

    doc.fontSize(22).fillColor('#111').text('Programming Brief', { align: 'left' });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#666').text('AIRecommendationsforbroadcasters / Custom Views');
    doc.fontSize(10).text('Generated: ' + new Date().toISOString());
    doc.moveDown(1);

    doc.fontSize(14).fillColor('#111').text('Executive Summary');
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#222').text(
      'Recommendation engine performance across audience segments is healthy with primetime drama and live sports driving the largest engagement lifts. The following brief summarizes the active recommendation rules, A/B groups, segment-level hit rates, and programming priorities for the upcoming broadcast cycle.',
      { align: 'justify' }
    );
    doc.moveDown(1);

    doc.fontSize(14).fillColor('#111').text('Active Recommendation Rules');
    doc.moveDown(0.3);
    rulesStore.rules.forEach((r) => {
      doc.fontSize(11).fillColor('#111').text(
        '- [' + (r.active ? 'ON ' : 'OFF') + '] ' + r.name + '  (seg=' + r.segment + ', type=' + r.contentType + ', w=' + r.weight + ', AB=' + r.abGroup + ')'
      );
    });
    doc.moveDown(1);

    doc.fontSize(14).fillColor('#111').text('Programming Priorities');
    doc.moveDown(0.3);
    ['Boost live sports lead-in slots on Saturday', 'Schedule drama premieres at 9pm local', 'Drive news segments into morning push notifications', 'Test family-friendly weekend blocks under A/B group B']
      .forEach((line) => doc.fontSize(11).fillColor('#222').text('- ' + line));
    doc.moveDown(1);

    doc.fontSize(9).fillColor('#888').text('Confidential. Generated by BroadcastAI Custom Views.', { align: 'center' });

    doc.end();
  } catch (e) {
    res.status(500).json({ ok: false, error: (e && e.message) || 'PDF generation failed' });
  }
});

// ---------------------------------------------------------------------------
// NON-VIZ 2: /api/custom-views/rules  (CRUD)
// list, create, update, delete recommendation rules
// ---------------------------------------------------------------------------
router.get('/rules', (req, res) => {
  res.json({ ok: true, count: rulesStore.rules.length, rules: rulesStore.rules });
});

router.post('/rules', (req, res) => {
  const b = req.body || {};
  const rule = {
    id: rulesStore.nextId++,
    name: String(b.name || 'New Rule'),
    segment: String(b.segment || 'casual'),
    contentType: String(b.contentType || 'series'),
    weight: typeof b.weight === 'number' ? b.weight : parseFloat(b.weight) || 1.0,
    abGroup: (b.abGroup === 'B' ? 'B' : 'A'),
    active: b.active !== false,
  };
  rulesStore.rules.push(rule);
  res.json({ ok: true, rule });
});

router.put('/rules/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = rulesStore.rules.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, error: 'Rule not found' });
  const b = req.body || {};
  const existing = rulesStore.rules[idx];
  const updated = {
    ...existing,
    ...(b.name !== undefined ? { name: String(b.name) } : {}),
    ...(b.segment !== undefined ? { segment: String(b.segment) } : {}),
    ...(b.contentType !== undefined ? { contentType: String(b.contentType) } : {}),
    ...(b.weight !== undefined ? { weight: parseFloat(b.weight) || 0 } : {}),
    ...(b.abGroup !== undefined ? { abGroup: (b.abGroup === 'B' ? 'B' : 'A') } : {}),
    ...(b.active !== undefined ? { active: !!b.active } : {}),
  };
  rulesStore.rules[idx] = updated;
  res.json({ ok: true, rule: updated });
});

router.delete('/rules/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const before = rulesStore.rules.length;
  rulesStore.rules = rulesStore.rules.filter((r) => r.id !== id);
  if (rulesStore.rules.length === before) return res.status(404).json({ ok: false, error: 'Rule not found' });
  res.json({ ok: true, deletedId: id });
});

module.exports = router;
