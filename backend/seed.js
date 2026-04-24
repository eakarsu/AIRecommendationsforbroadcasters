const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const {
  sequelize, User, Content, Category, Channel, LiveSport,
  ViewingHistory, Watchlist, Schedule, Playlist, PlaylistItem,
  Rating, Recommendation, Trending, Analytics, AIInsight, UserProfile
} = require('./models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('  Database tables created.');

    // ==================== USERS ====================
    const hashedPw = await bcrypt.hash('password123', 10);
    const users = await User.bulkCreate([
      { email: 'admin@broadcastai.com', password: hashedPw, name: 'Admin User', role: 'admin' },
      { email: 'editor@broadcastai.com', password: hashedPw, name: 'Sarah Editor', role: 'editor' },
      { email: 'viewer@broadcastai.com', password: hashedPw, name: 'John Viewer', role: 'viewer' },
      { email: 'demo@broadcastai.com', password: hashedPw, name: 'Demo User', role: 'viewer' },
      { email: 'alice@broadcastai.com', password: hashedPw, name: 'Alice Johnson', role: 'viewer' },
      { email: 'bob@broadcastai.com', password: hashedPw, name: 'Bob Williams', role: 'viewer' },
      { email: 'carol@broadcastai.com', password: hashedPw, name: 'Carol Davis', role: 'editor' },
      { email: 'david@broadcastai.com', password: hashedPw, name: 'David Brown', role: 'viewer' },
      { email: 'emma@broadcastai.com', password: hashedPw, name: 'Emma Wilson', role: 'viewer' },
      { email: 'frank@broadcastai.com', password: hashedPw, name: 'Frank Miller', role: 'viewer' },
      { email: 'grace@broadcastai.com', password: hashedPw, name: 'Grace Taylor', role: 'viewer' },
      { email: 'henry@broadcastai.com', password: hashedPw, name: 'Henry Anderson', role: 'viewer' },
      { email: 'iris@broadcastai.com', password: hashedPw, name: 'Iris Thomas', role: 'viewer' },
      { email: 'jack@broadcastai.com', password: hashedPw, name: 'Jack Martinez', role: 'viewer' },
      { email: 'kate@broadcastai.com', password: hashedPw, name: 'Kate Robinson', role: 'viewer' }
    ]);
    console.log('  Users seeded: 15');

    // ==================== CATEGORIES ====================
    const categories = await Category.bulkCreate([
      { name: 'Drama', description: 'Dramatic series and films', icon: 'theater_comedy', color: '#e74c3c', sortOrder: 1 },
      { name: 'Live Sports', description: 'Live sporting events and coverage', icon: 'sports', color: '#2ecc71', sortOrder: 2 },
      { name: 'Soap Opera', description: 'Daily and weekly soap operas', icon: 'movie', color: '#9b59b6', sortOrder: 3 },
      { name: 'Documentary', description: 'Factual and documentary programming', icon: 'science', color: '#3498db', sortOrder: 4 },
      { name: 'News', description: 'Breaking news and current affairs', icon: 'newspaper', color: '#e67e22', sortOrder: 5 },
      { name: 'Reality TV', description: 'Reality television shows', icon: 'tv', color: '#f39c12', sortOrder: 6 },
      { name: 'Comedy', description: 'Comedy series and specials', icon: 'sentiment_very_satisfied', color: '#1abc9c', sortOrder: 7 },
      { name: 'Thriller', description: 'Suspense and thriller content', icon: 'bolt', color: '#34495e', sortOrder: 8 },
      { name: 'Kids & Family', description: 'Family-friendly programming', icon: 'child_care', color: '#e91e63', sortOrder: 9 },
      { name: 'Sci-Fi', description: 'Science fiction and fantasy', icon: 'rocket', color: '#00bcd4', sortOrder: 10 },
      { name: 'Talk Show', description: 'Talk shows and interviews', icon: 'mic', color: '#ff5722', sortOrder: 11 },
      { name: 'Music', description: 'Music shows and concerts', icon: 'music_note', color: '#673ab7', sortOrder: 12 },
      { name: 'Cooking', description: 'Cooking and food shows', icon: 'restaurant', color: '#795548', sortOrder: 13 },
      { name: 'Travel', description: 'Travel and adventure shows', icon: 'flight', color: '#009688', sortOrder: 14 },
      { name: 'True Crime', description: 'True crime documentaries and series', icon: 'search', color: '#607d8b', sortOrder: 15 }
    ]);
    console.log('  Categories seeded: 15');

    // ==================== CHANNELS ====================
    const channels = await Channel.bulkCreate([
      { name: 'BroadcastAI One', description: 'Our flagship entertainment channel', type: 'broadcast', region: 'National', isLive: true, viewerCount: 2500000, status: 'active' },
      { name: 'BroadcastAI Sports', description: 'Dedicated live sports channel', type: 'broadcast', region: 'National', isLive: true, viewerCount: 1800000, status: 'active' },
      { name: 'BroadcastAI Drama', description: 'Premium drama and series', type: 'premium', region: 'National', isLive: false, viewerCount: 950000, status: 'active' },
      { name: 'BroadcastAI News 24', description: '24-hour news coverage', type: 'broadcast', region: 'National', isLive: true, viewerCount: 1200000, status: 'active' },
      { name: 'BroadcastAI Kids', description: 'Children and family programming', type: 'broadcast', region: 'National', isLive: false, viewerCount: 650000, status: 'active' },
      { name: 'BroadcastAI Stream', description: 'On-demand streaming platform', type: 'streaming', region: 'Global', isLive: false, viewerCount: 3200000, status: 'active' },
      { name: 'BroadcastAI Docs', description: 'Documentary channel', type: 'broadcast', region: 'National', isLive: false, viewerCount: 420000, status: 'active' },
      { name: 'BroadcastAI Music', description: 'Music and concert channel', type: 'broadcast', region: 'National', isLive: true, viewerCount: 380000, status: 'active' },
      { name: 'BroadcastAI Comedy', description: 'Comedy and entertainment', type: 'on_demand', region: 'Global', isLive: false, viewerCount: 560000, status: 'active' },
      { name: 'BroadcastAI Lifestyle', description: 'Lifestyle, cooking, and travel', type: 'broadcast', region: 'National', isLive: false, viewerCount: 290000, status: 'active' },
      { name: 'BroadcastAI Reality', description: 'Reality TV and competitions', type: 'broadcast', region: 'National', isLive: true, viewerCount: 870000, status: 'active' },
      { name: 'BroadcastAI Plus', description: 'Premium subscription channel', type: 'premium', region: 'Global', isLive: false, viewerCount: 1500000, status: 'active' },
      { name: 'BroadcastAI Local', description: 'Regional and local content', type: 'broadcast', region: 'Regional', isLive: true, viewerCount: 180000, status: 'active' },
      { name: 'BroadcastAI Classic', description: 'Classic and retro programming', type: 'on_demand', region: 'National', isLive: false, viewerCount: 210000, status: 'active' },
      { name: 'BroadcastAI Sports 2', description: 'Secondary sports channel', type: 'broadcast', region: 'National', isLive: true, viewerCount: 720000, status: 'active' }
    ]);
    console.log('  Channels seeded: 15');

    // ==================== CONTENT ====================
    const contents = await Content.bulkCreate([
      { title: 'The Crown Season 7', description: 'The final chapter of the British royal family saga', type: 'series', genre: 'Drama', duration: 60, rating: 9.2, releaseDate: '2024-11-15', language: 'English', tags: ['royalty', 'british', 'historical'], status: 'active', viewCount: 15000000, categoryId: 1 },
      { title: 'Premier League: Arsenal vs Liverpool', description: 'Top of the table clash at the Emirates Stadium', type: 'live_sport', genre: 'Football', duration: 120, rating: 9.5, releaseDate: '2024-12-20', language: 'English', tags: ['football', 'premier-league', 'live'], status: 'active', viewCount: 8500000, categoryId: 2 },
      { title: 'EastEnders: Christmas Special', description: 'Drama unfolds in Albert Square this Christmas', type: 'soap_opera', genre: 'Soap Opera', duration: 60, rating: 7.8, releaseDate: '2024-12-25', language: 'English', tags: ['soap', 'christmas', 'family'], status: 'active', viewCount: 6200000, categoryId: 3 },
      { title: 'Planet Earth IV', description: 'A breathtaking exploration of our natural world', type: 'documentary', genre: 'Nature', duration: 50, rating: 9.8, releaseDate: '2024-10-01', language: 'English', tags: ['nature', 'wildlife', 'bbc'], status: 'active', viewCount: 12000000, categoryId: 4 },
      { title: 'Breaking News Tonight', description: 'Live coverage of the latest global events', type: 'news', genre: 'News', duration: 60, rating: 7.5, releaseDate: '2024-12-01', language: 'English', tags: ['news', 'live', 'current-affairs'], status: 'active', viewCount: 4500000, categoryId: 5 },
      { title: 'Love Island Winter 2025', description: 'Singles looking for love in a tropical villa', type: 'reality_show', genre: 'Reality', duration: 60, rating: 6.8, releaseDate: '2025-01-15', language: 'English', tags: ['reality', 'dating', 'entertainment'], status: 'upcoming', viewCount: 0, categoryId: 6 },
      { title: 'Succession: The Final Act', description: 'The Roy family faces their ultimate reckoning', type: 'series', genre: 'Drama', duration: 65, rating: 9.6, releaseDate: '2024-09-01', language: 'English', tags: ['business', 'family', 'power'], status: 'active', viewCount: 18000000, categoryId: 1 },
      { title: 'Champions League Final', description: 'The pinnacle of European club football', type: 'live_sport', genre: 'Football', duration: 135, rating: 9.7, releaseDate: '2025-05-31', language: 'English', tags: ['football', 'champions-league', 'final'], status: 'upcoming', viewCount: 0, categoryId: 2 },
      { title: 'Coronation Street: 10000th Episode', description: 'A milestone celebration on the cobbles', type: 'soap_opera', genre: 'Soap Opera', duration: 90, rating: 8.2, releaseDate: '2024-11-01', language: 'English', tags: ['soap', 'milestone', 'celebration'], status: 'active', viewCount: 7800000, categoryId: 3 },
      { title: 'Blue Planet Live', description: 'Live underwater exploration of ocean ecosystems', type: 'documentary', genre: 'Nature', duration: 90, rating: 9.4, releaseDate: '2024-08-15', language: 'English', tags: ['ocean', 'marine', 'live'], status: 'active', viewCount: 9500000, categoryId: 4 },
      { title: 'The Great British Bake Off', description: 'Amateur bakers compete in the iconic tent', type: 'reality_show', genre: 'Cooking', duration: 75, rating: 8.5, releaseDate: '2024-09-10', language: 'English', tags: ['baking', 'competition', 'british'], status: 'active', viewCount: 5600000, categoryId: 13 },
      { title: 'Wimbledon Finals', description: 'The most prestigious tennis tournament', type: 'live_sport', genre: 'Tennis', duration: 240, rating: 9.3, releaseDate: '2025-07-13', language: 'English', tags: ['tennis', 'wimbledon', 'live'], status: 'upcoming', viewCount: 0, categoryId: 2 },
      { title: 'Sherlock: The Return', description: 'Holmes and Watson tackle their most complex case yet', type: 'series', genre: 'Thriller', duration: 90, rating: 9.1, releaseDate: '2024-12-01', language: 'English', tags: ['detective', 'mystery', 'british'], status: 'active', viewCount: 14000000, categoryId: 8 },
      { title: 'Doctor Who: Gallifrey', description: 'The Doctor returns to their home planet', type: 'series', genre: 'Sci-Fi', duration: 50, rating: 8.7, releaseDate: '2024-11-23', language: 'English', tags: ['sci-fi', 'adventure', 'time-travel'], status: 'active', viewCount: 8900000, categoryId: 10 },
      { title: 'Strictly Come Dancing', description: 'Celebrities paired with professional dancers', type: 'reality_show', genre: 'Entertainment', duration: 120, rating: 8.0, releaseDate: '2024-09-20', language: 'English', tags: ['dance', 'celebrity', 'competition'], status: 'active', viewCount: 7200000, categoryId: 6 },
      { title: 'World Cup Qualifiers Special', description: 'Comprehensive coverage of World Cup qualifying matches', type: 'live_sport', genre: 'Football', duration: 180, rating: 8.8, releaseDate: '2024-11-18', language: 'English', tags: ['football', 'world-cup', 'international'], status: 'active', viewCount: 6800000, categoryId: 2 },
      { title: 'The Graham Norton Show', description: 'Celebrity interviews and entertainment', type: 'talk_show', genre: 'Talk Show', duration: 45, rating: 8.3, releaseDate: '2024-10-05', language: 'English', tags: ['talk-show', 'celebrity', 'comedy'], status: 'active', viewCount: 4200000, categoryId: 11 },
      { title: 'David Attenborough: A Life on Our Planet', description: 'A witness statement and vision for the future', type: 'documentary', genre: 'Nature', duration: 83, rating: 9.6, releaseDate: '2024-04-22', language: 'English', tags: ['environment', 'nature', 'conservation'], status: 'active', viewCount: 11000000, categoryId: 4 },
      { title: 'Peaky Blinders: The Movie', description: 'The Shelby family saga concludes on the big screen', type: 'movie', genre: 'Crime Drama', duration: 150, rating: 9.0, releaseDate: '2025-03-01', language: 'English', tags: ['crime', 'period', 'gangster'], status: 'upcoming', viewCount: 0, categoryId: 1 },
      { title: 'Formula 1: Season Review', description: 'Complete review of the F1 championship season', type: 'documentary', genre: 'Sports', duration: 120, rating: 8.6, releaseDate: '2024-12-10', language: 'English', tags: ['f1', 'motorsport', 'review'], status: 'active', viewCount: 3800000, categoryId: 4 }
    ]);
    console.log('  Content seeded: 20');

    // ==================== LIVE SPORTS ====================
    const now = new Date();
    await LiveSport.bulkCreate([
      { title: 'Premier League: Arsenal vs Liverpool', sport: 'Football', league: 'Premier League', teamHome: 'Arsenal', teamAway: 'Liverpool', venue: 'Emirates Stadium', startTime: new Date(now.getTime() + 2 * 3600000), endTime: new Date(now.getTime() + 4 * 3600000), status: 'upcoming', viewerCount: 0, channelId: 2 },
      { title: 'Champions League: PSG vs Bayern', sport: 'Football', league: 'Champions League', teamHome: 'PSG', teamAway: 'Bayern Munich', venue: 'Parc des Princes', startTime: new Date(now.getTime() + 24 * 3600000), endTime: new Date(now.getTime() + 26 * 3600000), status: 'upcoming', viewerCount: 0, channelId: 2 },
      { title: 'Wimbledon Men\'s Final', sport: 'Tennis', league: 'Grand Slam', teamHome: 'Player A', teamAway: 'Player B', venue: 'Centre Court', startTime: new Date(now.getTime() - 1 * 3600000), endTime: new Date(now.getTime() + 2 * 3600000), status: 'live', viewerCount: 2300000, channelId: 2 },
      { title: 'NBA Finals Game 7', sport: 'Basketball', league: 'NBA', teamHome: 'LA Lakers', teamAway: 'Boston Celtics', venue: 'Crypto.com Arena', startTime: new Date(now.getTime() + 48 * 3600000), endTime: new Date(now.getTime() + 51 * 3600000), status: 'upcoming', viewerCount: 0, channelId: 15 },
      { title: 'The Ashes: 5th Test', sport: 'Cricket', league: 'The Ashes', teamHome: 'England', teamAway: 'Australia', venue: 'The Oval', startTime: new Date(now.getTime() - 2 * 3600000), endTime: new Date(now.getTime() + 6 * 3600000), status: 'live', viewerCount: 1500000, channelId: 2 },
      { title: 'Six Nations: England vs France', sport: 'Rugby', league: 'Six Nations', teamHome: 'England', teamAway: 'France', venue: 'Twickenham', startTime: new Date(now.getTime() + 72 * 3600000), endTime: new Date(now.getTime() + 74 * 3600000), status: 'upcoming', viewerCount: 0, channelId: 15 },
      { title: 'F1 British Grand Prix', sport: 'Formula 1', league: 'F1 World Championship', teamHome: 'Multiple Teams', teamAway: '-', venue: 'Silverstone Circuit', startTime: new Date(now.getTime() + 120 * 3600000), endTime: new Date(now.getTime() + 122 * 3600000), status: 'upcoming', viewerCount: 0, channelId: 2 },
      { title: 'UFC 315: Main Card', sport: 'MMA', league: 'UFC', teamHome: 'Fighter A', teamAway: 'Fighter B', venue: 'T-Mobile Arena', startTime: new Date(now.getTime() + 96 * 3600000), endTime: new Date(now.getTime() + 100 * 3600000), status: 'upcoming', viewerCount: 0, channelId: 15 },
      { title: 'The Open Championship: Day 4', sport: 'Golf', league: 'Major Championship', teamHome: 'Multiple Players', teamAway: '-', venue: 'St Andrews', startTime: new Date(now.getTime() + 168 * 3600000), endTime: new Date(now.getTime() + 176 * 3600000), status: 'upcoming', viewerCount: 0, channelId: 2 },
      { title: 'World Cup Qualifier: England vs Germany', sport: 'Football', league: 'World Cup Qualifying', teamHome: 'England', teamAway: 'Germany', venue: 'Wembley Stadium', startTime: new Date(now.getTime() + 36 * 3600000), endTime: new Date(now.getTime() + 38 * 3600000), status: 'upcoming', viewerCount: 0, channelId: 2 },
      { title: 'IPL Final 2025', sport: 'Cricket', league: 'IPL', teamHome: 'Mumbai Indians', teamAway: 'Chennai Super Kings', venue: 'Narendra Modi Stadium', startTime: new Date(now.getTime() + 200 * 3600000), endTime: new Date(now.getTime() + 204 * 3600000), status: 'upcoming', viewerCount: 0, channelId: 15 },
      { title: 'Tour de France: Stage 21', sport: 'Cycling', league: 'Tour de France', teamHome: 'Multiple Teams', teamAway: '-', venue: 'Paris', startTime: new Date(now.getTime() + 240 * 3600000), endTime: new Date(now.getTime() + 245 * 3600000), status: 'upcoming', viewerCount: 0, channelId: 2 },
      { title: 'Boxing: World Heavyweight Title', sport: 'Boxing', league: 'WBA/WBC', teamHome: 'Champion', teamAway: 'Challenger', venue: 'Madison Square Garden', startTime: new Date(now.getTime() + 144 * 3600000), endTime: new Date(now.getTime() + 148 * 3600000), status: 'upcoming', viewerCount: 0, channelId: 15 },
      { title: 'La Liga: Real Madrid vs Barcelona', sport: 'Football', league: 'La Liga', teamHome: 'Real Madrid', teamAway: 'Barcelona', venue: 'Santiago Bernabeu', startTime: new Date(now.getTime() + 60 * 3600000), endTime: new Date(now.getTime() + 62 * 3600000), status: 'upcoming', viewerCount: 0, channelId: 2 },
      { title: 'Super Bowl LIX', sport: 'American Football', league: 'NFL', teamHome: 'NFC Champion', teamAway: 'AFC Champion', venue: 'Caesars Superdome', startTime: new Date(now.getTime() + 300 * 3600000), endTime: new Date(now.getTime() + 304 * 3600000), status: 'upcoming', viewerCount: 0, channelId: 15 }
    ]);
    console.log('  Live Sports seeded: 15');

    // ==================== USER PROFILES ====================
    await UserProfile.bulkCreate([
      { userId: 1, displayName: 'Admin', age: 35, gender: 'Male', location: 'London', favoriteGenres: ['Drama', 'News'], favoriteTeams: ['Arsenal'], watchTime: 42.5, subscriptionTier: 'premium', devicePreference: 'Smart TV' },
      { userId: 2, displayName: 'Sarah E.', age: 28, gender: 'Female', location: 'Manchester', favoriteGenres: ['Drama', 'Soap Opera'], favoriteTeams: ['Manchester United'], watchTime: 35.0, subscriptionTier: 'premium', devicePreference: 'Tablet' },
      { userId: 3, displayName: 'John V.', age: 42, gender: 'Male', location: 'Birmingham', favoriteGenres: ['Sports', 'Documentary'], favoriteTeams: ['Aston Villa'], watchTime: 28.0, subscriptionTier: 'basic', devicePreference: 'Smart TV' },
      { userId: 4, displayName: 'Demo', age: 30, gender: 'Other', location: 'London', favoriteGenres: ['Comedy', 'Sci-Fi'], favoriteTeams: ['Chelsea'], watchTime: 20.0, subscriptionTier: 'free', devicePreference: 'Mobile' },
      { userId: 5, displayName: 'Alice J.', age: 25, gender: 'Female', location: 'Bristol', favoriteGenres: ['Reality', 'Comedy'], favoriteTeams: [], watchTime: 15.5, subscriptionTier: 'basic', devicePreference: 'Mobile' },
      { userId: 6, displayName: 'Bob W.', age: 55, gender: 'Male', location: 'Edinburgh', favoriteGenres: ['Documentary', 'News', 'Drama'], favoriteTeams: ['Celtic'], watchTime: 45.0, subscriptionTier: 'premium', devicePreference: 'Smart TV' },
      { userId: 7, displayName: 'Carol D.', age: 33, gender: 'Female', location: 'Cardiff', favoriteGenres: ['Thriller', 'True Crime'], favoriteTeams: ['Cardiff City'], watchTime: 22.0, subscriptionTier: 'basic', devicePreference: 'Laptop' },
      { userId: 8, displayName: 'David B.', age: 48, gender: 'Male', location: 'Liverpool', favoriteGenres: ['Sports', 'Talk Show'], favoriteTeams: ['Liverpool', 'England'], watchTime: 38.0, subscriptionTier: 'premium', devicePreference: 'Smart TV' },
      { userId: 9, displayName: 'Emma W.', age: 22, gender: 'Female', location: 'Leeds', favoriteGenres: ['Reality', 'Music'], favoriteTeams: [], watchTime: 12.0, subscriptionTier: 'free', devicePreference: 'Mobile' },
      { userId: 10, displayName: 'Frank M.', age: 60, gender: 'Male', location: 'Newcastle', favoriteGenres: ['News', 'Documentary', 'Drama'], favoriteTeams: ['Newcastle United'], watchTime: 50.0, subscriptionTier: 'premium', devicePreference: 'Smart TV' },
      { userId: 11, displayName: 'Grace T.', age: 38, gender: 'Female', location: 'Glasgow', favoriteGenres: ['Cooking', 'Travel', 'Reality'], favoriteTeams: [], watchTime: 18.0, subscriptionTier: 'basic', devicePreference: 'Tablet' },
      { userId: 12, displayName: 'Henry A.', age: 29, gender: 'Male', location: 'Belfast', favoriteGenres: ['Sci-Fi', 'Thriller', 'Comedy'], favoriteTeams: ['Linfield'], watchTime: 25.0, subscriptionTier: 'basic', devicePreference: 'Laptop' },
      { userId: 13, displayName: 'Iris T.', age: 45, gender: 'Female', location: 'Oxford', favoriteGenres: ['Drama', 'Documentary'], favoriteTeams: [], watchTime: 30.0, subscriptionTier: 'premium', devicePreference: 'Smart TV' },
      { userId: 14, displayName: 'Jack M.', age: 19, gender: 'Male', location: 'Brighton', favoriteGenres: ['Sports', 'Comedy', 'Sci-Fi'], favoriteTeams: ['Brighton'], watchTime: 10.0, subscriptionTier: 'free', devicePreference: 'Mobile' },
      { userId: 15, displayName: 'Kate R.', age: 36, gender: 'Female', location: 'Norwich', favoriteGenres: ['Soap Opera', 'Reality', 'Drama'], favoriteTeams: ['Norwich City'], watchTime: 32.0, subscriptionTier: 'basic', devicePreference: 'Tablet' }
    ]);
    console.log('  User Profiles seeded: 15');

    // ==================== VIEWING HISTORY ====================
    const historyData = [];
    for (let i = 0; i < 15; i++) {
      const uid = (i % 15) + 1;
      const cid = (i % 20) + 1;
      historyData.push({
        userId: uid, contentId: cid,
        watchedAt: new Date(now.getTime() - (i * 24 + Math.random() * 12) * 3600000),
        duration: Math.floor(30 + Math.random() * 90),
        completed: Math.random() > 0.3,
        progress: Math.floor(40 + Math.random() * 60),
        device: ['Smart TV', 'Mobile', 'Tablet', 'Laptop'][i % 4],
        rating: Math.round((3 + Math.random() * 2) * 10) / 10
      });
    }
    await ViewingHistory.bulkCreate(historyData);
    console.log('  Viewing History seeded: 15');

    // ==================== WATCHLIST ====================
    const watchlistData = [];
    for (let i = 0; i < 15; i++) {
      watchlistData.push({
        userId: (i % 15) + 1,
        contentId: ((i * 3) % 20) + 1,
        priority: ['high', 'medium', 'low'][i % 3],
        notes: ['Must watch!', 'Recommended by friend', 'Looks interesting', 'Award winning', 'For the weekend'][i % 5],
        addedAt: new Date(now.getTime() - i * 48 * 3600000)
      });
    }
    await Watchlist.bulkCreate(watchlistData);
    console.log('  Watchlist seeded: 15');

    // ==================== SCHEDULE ====================
    const scheduleData = [];
    const slotNames = [
      'Morning News', 'Kids Block', 'Soap Hour', 'Afternoon Movie', 'Sports Preview',
      'Evening Drama', 'Prime Time Special', 'Late Night Comedy', 'Documentary Hour', 'Reality Block',
      'Weekend Sports', 'Family Movie Night', 'True Crime Marathon', 'Music Live', 'News Roundup'
    ];
    for (let i = 0; i < 15; i++) {
      const start = new Date(now.getTime() + (i * 3 - 6) * 3600000);
      scheduleData.push({
        contentId: (i % 20) + 1,
        channelId: (i % 15) + 1,
        title: slotNames[i],
        startTime: start,
        endTime: new Date(start.getTime() + (60 + (i % 3) * 30) * 60000),
        isRepeat: i % 4 === 0,
        isPrimetime: i >= 5 && i <= 8,
        status: i < 3 ? 'completed' : i < 6 ? 'airing' : 'scheduled'
      });
    }
    await Schedule.bulkCreate(scheduleData);
    console.log('  Schedule seeded: 15');

    // ==================== PLAYLISTS ====================
    const playlists = await Playlist.bulkCreate([
      { name: 'Weekend Binge: Drama', description: 'The best dramas to binge this weekend', isPublic: true, itemCount: 5, tags: ['drama', 'binge', 'weekend'], curatedBy: 'Editorial Team' },
      { name: 'Sports Highlights', description: 'Top sporting moments of the month', isPublic: true, itemCount: 4, tags: ['sports', 'highlights'], curatedBy: 'Sports Desk' },
      { name: 'Nature & Wildlife', description: 'Stunning nature documentaries collection', isPublic: true, itemCount: 3, tags: ['nature', 'documentary'], curatedBy: 'Documentary Team' },
      { name: 'Family Movie Night', description: 'Perfect picks for family viewing', isPublic: true, itemCount: 4, tags: ['family', 'movies', 'kids'], curatedBy: 'Family Content Team' },
      { name: 'True Crime Essentials', description: 'Gripping true crime stories', isPublic: true, itemCount: 3, tags: ['true-crime', 'documentary'], curatedBy: 'Editorial Team' },
      { name: 'British Comedy Gold', description: 'Classic and modern British comedy', isPublic: true, itemCount: 3, tags: ['comedy', 'british'], curatedBy: 'Comedy Team' },
      { name: 'Soap Catch-Up', description: 'Catch up on your favorite soaps', isPublic: true, itemCount: 2, tags: ['soap', 'catch-up'], curatedBy: 'Soap Desk' },
      { name: 'Sci-Fi Adventures', description: 'Journey through space and time', isPublic: true, itemCount: 2, tags: ['sci-fi', 'adventure'], curatedBy: 'Sci-Fi Fans Club' },
      { name: 'Award Winners 2024', description: 'Content that won major awards this year', isPublic: true, itemCount: 4, tags: ['awards', 'best-of'], curatedBy: 'Editorial Team' },
      { name: 'Cooking Masterclass', description: 'Learn from the best chefs', isPublic: true, itemCount: 2, tags: ['cooking', 'food'], curatedBy: 'Lifestyle Team' },
      { name: 'New This Week', description: 'Fresh content added this week', isPublic: true, itemCount: 5, tags: ['new', 'fresh'], curatedBy: 'System' },
      { name: 'Trending Now', description: 'What everyone is watching', isPublic: true, itemCount: 4, tags: ['trending', 'popular'], curatedBy: 'Algorithm' },
      { name: 'Late Night Picks', description: 'Perfect for late night viewing', isPublic: true, itemCount: 3, tags: ['late-night', 'adult'], curatedBy: 'Editorial Team' },
      { name: 'Sports Documentary', description: 'Behind the scenes of sports', isPublic: true, itemCount: 2, tags: ['sports', 'documentary'], curatedBy: 'Sports Desk' },
      { name: 'Feel Good Collection', description: 'Uplifting content to brighten your day', isPublic: true, itemCount: 3, tags: ['feel-good', 'positive'], curatedBy: 'Wellness Team' }
    ]);

    // Add some playlist items
    const playlistItems = [];
    for (let p = 0; p < 15; p++) {
      const count = playlists[p].itemCount;
      for (let i = 0; i < count; i++) {
        playlistItems.push({
          playlistId: playlists[p].id,
          contentId: ((p + i * 3) % 20) + 1,
          sortOrder: i
        });
      }
    }
    await PlaylistItem.bulkCreate(playlistItems);
    console.log('  Playlists seeded: 15');

    // ==================== RATINGS ====================
    const ratingReviews = [
      'Absolutely brilliant! One of the best shows I\'ve ever seen.',
      'Great production value but the story could be better.',
      'A masterpiece of television. Must watch!',
      'Good entertainment, perfect for a lazy Sunday.',
      'Exceeded my expectations in every way.',
      'Solid show but not groundbreaking.',
      'The acting is superb, especially the lead.',
      'Could have been better, but still enjoyable.',
      'This is peak television. No notes.',
      'Entertaining but a bit predictable.',
      'Stunning visuals and compelling narrative.',
      'One of those rare shows that gets better each episode.',
      'A bit slow to start but worth sticking with.',
      'Perfect weekend viewing for the whole family.',
      'The best content on the platform right now.'
    ];
    const ratingsData = [];
    for (let i = 0; i < 15; i++) {
      ratingsData.push({
        userId: (i % 15) + 1,
        contentId: (i % 20) + 1,
        score: Math.round((3 + Math.random() * 2) * 10) / 10,
        review: ratingReviews[i],
        helpful: Math.floor(Math.random() * 50),
        verified: Math.random() > 0.3
      });
    }
    await Rating.bulkCreate(ratingsData);
    console.log('  Ratings seeded: 15');

    // ==================== RECOMMENDATIONS ====================
    const recReasons = [
      'Based on your love of British drama and historical content',
      'Popular among viewers with similar taste profiles',
      'Matches your weekend sports viewing pattern',
      'Highly rated in your preferred genre category',
      'Recommended by viewers who also watched your favorites',
      'Trending content matching your interests',
      'New release in a genre you frequently watch',
      'AI-detected similarity to your top-rated content',
      'Popular in your region and demographic',
      'Based on your viewing history pattern',
      'Award-winning content matching your preferences',
      'Curated pick from our editorial team for your profile',
      'Based on collaborative filtering with similar users',
      'Seasonal recommendation based on past behavior',
      'Cross-genre pick to broaden your content discovery'
    ];
    const recsData = [];
    for (let i = 0; i < 15; i++) {
      recsData.push({
        userId: (i % 15) + 1,
        contentId: ((i * 2 + 3) % 20) + 1,
        reason: recReasons[i],
        score: Math.round((70 + Math.random() * 30) * 10) / 10,
        algorithm: ['ai_personalized', 'collaborative', 'content_based', 'trending', 'editorial'][i % 5],
        status: 'active'
      });
    }
    await Recommendation.bulkCreate(recsData);
    console.log('  Recommendations seeded: 15');

    // ==================== TRENDING ====================
    const trendingData = [];
    for (let i = 0; i < 15; i++) {
      trendingData.push({
        contentId: (i % 20) + 1,
        trendScore: Math.round((50 + Math.random() * 50) * 10) / 10,
        viewsToday: Math.floor(100000 + Math.random() * 900000),
        viewsWeek: Math.floor(500000 + Math.random() * 5000000),
        growthRate: Math.round((-10 + Math.random() * 60) * 10) / 10,
        region: ['UK', 'Global', 'US', 'Europe', 'Asia'][i % 5],
        rank: i + 1,
        category: ['Drama', 'Sports', 'Documentary', 'Entertainment', 'News'][i % 5]
      });
    }
    await Trending.bulkCreate(trendingData);
    console.log('  Trending seeded: 15');

    // ==================== ANALYTICS ====================
    const metrics = ['daily_viewers', 'avg_watch_time', 'completion_rate', 'engagement_score', 'new_subscribers'];
    const regions = ['UK', 'US', 'Europe', 'Asia', 'Global'];
    const demographics = ['18-24', '25-34', '35-44', '45-54', '55+'];
    const analyticsData = [];
    for (let i = 0; i < 15; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      analyticsData.push({
        contentId: (i % 20) + 1,
        channelId: (i % 15) + 1,
        metric: metrics[i % 5],
        value: Math.round(Math.random() * 10000) / 10,
        date: d.toISOString().split('T')[0],
        region: regions[i % 5],
        demographic: demographics[i % 5],
        metadata: { source: 'automated', confidence: 0.9 + Math.random() * 0.1 }
      });
    }
    await Analytics.bulkCreate(analyticsData);
    console.log('  Analytics seeded: 15');

    // ==================== AI INSIGHTS ====================
    const insightTypes = ['recommendation', 'trend_analysis', 'audience_insight', 'content_optimization', 'schedule_suggestion'];
    const insightTitles = [
      'Increase Drama Investment for Q1',
      'Sports Content Driving Peak Engagement',
      'Youth Demographic Shifting to Mobile',
      'Soap Opera Schedule Optimization Needed',
      'Documentary Content Gap in Evening Slots',
      'True Crime Genre Growing 45% Quarter-over-Quarter',
      'Live Sports Pre-Show Boosts Main Event Retention',
      'Premium Tier Users Consume 3x More Content',
      'Regional Content Preferences Diverging',
      'AI-Predicted Breakout: Korean Drama Adaptations',
      'Personalization Engine Improving Click-Through by 28%',
      'Weekend Scheduling Underperforming vs Competitors',
      'News Content Retention Below Platform Average',
      'Cross-Promotion Opportunities Between Sports and Drama',
      'Family Content Block Performing Above Expectations'
    ];
    const insightsData = [];
    for (let i = 0; i < 15; i++) {
      insightsData.push({
        title: insightTitles[i],
        type: insightTypes[i % 5],
        summary: `Analysis shows significant opportunity in this area. Key metrics indicate a ${Math.floor(10 + Math.random() * 40)}% improvement potential with the right strategy adjustments.`,
        details: {
          title: insightTitles[i],
          sections: [{
            heading: 'Key Findings',
            items: [
              { metric: 'Impact Score', value: Math.round(70 + Math.random() * 30), trend: 'up' },
              { metric: 'Confidence', value: Math.round(75 + Math.random() * 25), trend: 'stable' }
            ]
          }],
          summary: `This insight suggests actionable changes that could improve overall platform performance.`
        },
        confidence: Math.round((0.7 + Math.random() * 0.3) * 100) / 100,
        status: ['new', 'reviewed', 'implemented', 'dismissed'][i % 4],
        aiModel: 'anthropic/claude-haiku-4.5',
        aiResponse: {}
      });
    }
    await AIInsight.bulkCreate(insightsData);
    console.log('  AI Insights seeded: 15');

    console.log('  ');
    console.log('  Seeding complete! All 15 features populated.');
    process.exit(0);
  } catch (err) {
    console.error('  Seed error:', err.message);
    process.exit(1);
  }
}

seed();
