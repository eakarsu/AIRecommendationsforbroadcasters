const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== USER ====================
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'editor', 'viewer'), defaultValue: 'viewer' },
  avatar: { type: DataTypes.STRING },
  preferences: { type: DataTypes.JSONB, defaultValue: {} }
}, { tableName: 'users', timestamps: true });

// ==================== CONTENT ====================
const Content = sequelize.define('Content', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  type: { type: DataTypes.ENUM('movie', 'series', 'live_sport', 'documentary', 'news', 'soap_opera', 'reality_show', 'talk_show'), allowNull: false },
  genre: { type: DataTypes.STRING },
  duration: { type: DataTypes.INTEGER }, // minutes
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
  thumbnail: { type: DataTypes.STRING },
  releaseDate: { type: DataTypes.DATEONLY },
  language: { type: DataTypes.STRING, defaultValue: 'English' },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  status: { type: DataTypes.ENUM('active', 'archived', 'upcoming'), defaultValue: 'active' },
  viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  metadata: { type: DataTypes.JSONB, defaultValue: {} }
}, { tableName: 'contents', timestamps: true });

// ==================== CATEGORY ====================
const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  icon: { type: DataTypes.STRING },
  color: { type: DataTypes.STRING, defaultValue: '#6366f1' },
  parentId: { type: DataTypes.INTEGER },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'categories', timestamps: true });

// ==================== CHANNEL ====================
const Channel = sequelize.define('Channel', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  logo: { type: DataTypes.STRING },
  type: { type: DataTypes.ENUM('broadcast', 'streaming', 'on_demand', 'premium'), defaultValue: 'broadcast' },
  region: { type: DataTypes.STRING },
  language: { type: DataTypes.STRING, defaultValue: 'English' },
  isLive: { type: DataTypes.BOOLEAN, defaultValue: false },
  viewerCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('active', 'inactive', 'maintenance'), defaultValue: 'active' }
}, { tableName: 'channels', timestamps: true });

// ==================== LIVE SPORT ====================
const LiveSport = sequelize.define('LiveSport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  sport: { type: DataTypes.STRING, allowNull: false },
  league: { type: DataTypes.STRING },
  teamHome: { type: DataTypes.STRING },
  teamAway: { type: DataTypes.STRING },
  venue: { type: DataTypes.STRING },
  startTime: { type: DataTypes.DATE },
  endTime: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('upcoming', 'live', 'completed', 'postponed'), defaultValue: 'upcoming' },
  thumbnail: { type: DataTypes.STRING },
  viewerCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  channelId: { type: DataTypes.INTEGER }
}, { tableName: 'live_sports', timestamps: true });

// ==================== VIEWING HISTORY ====================
const ViewingHistory = sequelize.define('ViewingHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  contentId: { type: DataTypes.INTEGER, allowNull: false },
  watchedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  duration: { type: DataTypes.INTEGER }, // minutes watched
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  progress: { type: DataTypes.FLOAT, defaultValue: 0 }, // percentage
  device: { type: DataTypes.STRING },
  rating: { type: DataTypes.FLOAT }
}, { tableName: 'viewing_history', timestamps: true });

// ==================== WATCHLIST ====================
const Watchlist = sequelize.define('Watchlist', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  contentId: { type: DataTypes.INTEGER, allowNull: false },
  priority: { type: DataTypes.ENUM('high', 'medium', 'low'), defaultValue: 'medium' },
  notes: { type: DataTypes.TEXT },
  addedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'watchlists', timestamps: true });

// ==================== SCHEDULE ====================
const Schedule = sequelize.define('Schedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  contentId: { type: DataTypes.INTEGER },
  channelId: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING, allowNull: false },
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE, allowNull: false },
  isRepeat: { type: DataTypes.BOOLEAN, defaultValue: false },
  isPrimetime: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.ENUM('scheduled', 'airing', 'completed', 'cancelled'), defaultValue: 'scheduled' }
}, { tableName: 'schedules', timestamps: true });

// ==================== PLAYLIST ====================
const Playlist = sequelize.define('Playlist', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  userId: { type: DataTypes.INTEGER },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
  thumbnail: { type: DataTypes.STRING },
  itemCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  curatedBy: { type: DataTypes.STRING, defaultValue: 'System' }
}, { tableName: 'playlists', timestamps: true });

// ==================== PLAYLIST ITEM ====================
const PlaylistItem = sequelize.define('PlaylistItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  playlistId: { type: DataTypes.INTEGER, allowNull: false },
  contentId: { type: DataTypes.INTEGER, allowNull: false },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'playlist_items', timestamps: true });

// ==================== RATING ====================
const Rating = sequelize.define('Rating', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  contentId: { type: DataTypes.INTEGER, allowNull: false },
  score: { type: DataTypes.FLOAT, allowNull: false },
  review: { type: DataTypes.TEXT },
  helpful: { type: DataTypes.INTEGER, defaultValue: 0 },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'ratings', timestamps: true });

// ==================== RECOMMENDATION ====================
const Recommendation = sequelize.define('Recommendation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  contentId: { type: DataTypes.INTEGER },
  reason: { type: DataTypes.TEXT },
  score: { type: DataTypes.FLOAT },
  algorithm: { type: DataTypes.STRING, defaultValue: 'ai_personalized' },
  status: { type: DataTypes.ENUM('active', 'dismissed', 'watched'), defaultValue: 'active' },
  aiResponse: { type: DataTypes.JSONB, defaultValue: {} }
}, { tableName: 'recommendations', timestamps: true });

// ==================== TRENDING ====================
const Trending = sequelize.define('Trending', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  contentId: { type: DataTypes.INTEGER, allowNull: false },
  trendScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  viewsToday: { type: DataTypes.INTEGER, defaultValue: 0 },
  viewsWeek: { type: DataTypes.INTEGER, defaultValue: 0 },
  growthRate: { type: DataTypes.FLOAT, defaultValue: 0 },
  region: { type: DataTypes.STRING, defaultValue: 'Global' },
  rank: { type: DataTypes.INTEGER },
  category: { type: DataTypes.STRING }
}, { tableName: 'trending', timestamps: true });

// ==================== ANALYTICS ====================
const Analytics = sequelize.define('Analytics', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  contentId: { type: DataTypes.INTEGER },
  channelId: { type: DataTypes.INTEGER },
  metric: { type: DataTypes.STRING, allowNull: false },
  value: { type: DataTypes.FLOAT, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  region: { type: DataTypes.STRING },
  demographic: { type: DataTypes.STRING },
  metadata: { type: DataTypes.JSONB, defaultValue: {} }
}, { tableName: 'analytics', timestamps: true });

// ==================== AI INSIGHT ====================
const AIInsight = sequelize.define('AIInsight', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('recommendation', 'trend_analysis', 'audience_insight', 'content_optimization', 'schedule_suggestion'), allowNull: false },
  summary: { type: DataTypes.TEXT },
  details: { type: DataTypes.JSONB, defaultValue: {} },
  confidence: { type: DataTypes.FLOAT },
  status: { type: DataTypes.ENUM('new', 'reviewed', 'implemented', 'dismissed'), defaultValue: 'new' },
  aiModel: { type: DataTypes.STRING },
  aiResponse: { type: DataTypes.JSONB, defaultValue: {} }
}, { tableName: 'ai_insights', timestamps: true });

// ==================== USER PROFILE ====================
const UserProfile = sequelize.define('UserProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  displayName: { type: DataTypes.STRING, allowNull: false },
  age: { type: DataTypes.INTEGER },
  gender: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  favoriteGenres: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  favoriteTeams: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  watchTime: { type: DataTypes.FLOAT, defaultValue: 0 },
  subscriptionTier: { type: DataTypes.ENUM('free', 'basic', 'premium', 'family'), defaultValue: 'free' },
  devicePreference: { type: DataTypes.STRING },
  notificationsEnabled: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'user_profiles', timestamps: true });

// ==================== ASSOCIATIONS ====================
Content.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Content, { foreignKey: 'categoryId', as: 'contents' });

LiveSport.belongsTo(Channel, { foreignKey: 'channelId', as: 'channel' });
Channel.hasMany(LiveSport, { foreignKey: 'channelId', as: 'sports' });

ViewingHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ViewingHistory.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });

Watchlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Watchlist.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });

Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Rating.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });

Recommendation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Recommendation.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });

Trending.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });

PlaylistItem.belongsTo(Playlist, { foreignKey: 'playlistId', as: 'playlist' });
PlaylistItem.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });
Playlist.hasMany(PlaylistItem, { foreignKey: 'playlistId', as: 'items' });

Schedule.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });
Schedule.belongsTo(Channel, { foreignKey: 'channelId', as: 'channel' });

UserProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Content,
  Category,
  Channel,
  LiveSport,
  ViewingHistory,
  Watchlist,
  Schedule,
  Playlist,
  PlaylistItem,
  Rating,
  Recommendation,
  Trending,
  Analytics,
  AIInsight,
  UserProfile
};
