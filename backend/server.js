const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.BACKEND_PORT || 4001;

// Middleware
app.use(cors());
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
app.use('/api/search', require('./routes/search'));
app.use('/api/profiles', require('./routes/profiles'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ alter: true });
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
