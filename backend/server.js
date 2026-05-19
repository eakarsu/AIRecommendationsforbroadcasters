const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.BACKEND_PORT || 4001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/content', require('./routes/content'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/channels', require('./routes/channels'));
app.use('/api/sports', require('./routes/sports'));
app.use('/api/history', require('./routes/history'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/playlists', require('./routes/playlists'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/trending', require('./routes/trending'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/ai', require('./routes/aiSchedule'));
app.use('/api/search', require('./routes/search'));
app.use('/api/profiles', require('./routes/profiles'));

// Custom Views (mounted BEFORE 404 handler)
app.use('/api/custom-views', require('./routes/customViews'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ alter: false });
    console.log('Models synced');
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();

// AI feature mount: personalized-schedule
app.use('/api/ai/personalized-schedule', require('./routes/ai-personalized-schedule'));
// === Batch 07 Gaps & Frontend Mounts ===
app.use('/api/gap-no-recommend-personalized-content-recommenda', require('./routes/gap-no-recommend-personalized-content-recommenda'));
app.use('/api/gap-no-scheduleoptimizer-programming-schedule-vi', require('./routes/gap-no-scheduleoptimizer-programming-schedule-vi'));
app.use('/api/gap-no-trenddetector-emerging-content-discovery', require('./routes/gap-no-trenddetector-emerging-content-discovery'));
app.use('/api/gap-no-audiencesegmentation-taste-clustering', require('./routes/gap-no-audiencesegmentation-taste-clustering'));
app.use('/api/gap-no-sportshighlightextraction-autoclip-moment', require('./routes/gap-no-sportshighlightextraction-autoclip-moment'));
app.use('/api/gap-no-subtitlegeneration-auto-captions', require('./routes/gap-no-subtitlegeneration-auto-captions'));
app.use('/api/gap-no-user-preference-learning-loop-implicit-fe', require('./routes/gap-no-user-preference-learning-loop-implicit-fe'));
app.use('/api/gap-no-ab-testing-framework-for-schedule-changes', require('./routes/gap-no-ab-testing-framework-for-schedule-changes'));
app.use('/api/gap-limited-audience-analytics-depth', require('./routes/gap-limited-audience-analytics-depth'));
app.use('/api/gap-no-sports-data-api-integration-scores-stats', require('./routes/gap-no-sports-data-api-integration-scores-stats'));
app.use('/api/gap-no-cdnstreaming-platform-integration', require('./routes/gap-no-cdnstreaming-platform-integration'));
app.use('/api/gap-no-admonetization-layer', require('./routes/gap-no-admonetization-layer'));
app.use('/api/gap-no-notificationsalerts-for-new-content', require('./routes/gap-no-notificationsalerts-for-new-content'));
// === End Batch 07 ===
