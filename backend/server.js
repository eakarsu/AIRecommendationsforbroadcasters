const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.BACKEND_PORT || 4001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
if ((process.env.JWT_SECRET || '').length < 32 || !process.env.GOVERNANCE_TENANT_ID || !process.env.DATABASE_URL) throw new Error('JWT_SECRET (32+ characters), GOVERNANCE_TENANT_ID, and DATABASE_URL are required');

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
if (process.env.ENABLE_GENERATED_ROUTES === 'true' && process.env.NODE_ENV !== 'production') app.use('/api/ai', require('./routes/aiSchedule'));
app.use('/api/search', require('./routes/search'));
app.use('/api/profiles', require('./routes/profiles'));

// Custom Views (mounted BEFORE 404 handler)
app.use('/api/custom-views', require('./routes/customViews'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/governed-broadcast-creation', require('./governance'));
if (process.env.ENABLE_GENERATED_ROUTES === 'true' && process.env.NODE_ENV !== 'production') app.use('/api/ai/personalized-schedule', require('./routes/ai-personalized-schedule'));

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
