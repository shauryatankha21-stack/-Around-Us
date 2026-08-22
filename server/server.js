require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');

const gamesRouter = require('./routes/games');
const profileRouter = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false // In production, serve from same origin
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/games', gamesRouter);
app.use('/api/profile', profileRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✦ Around Us server running on http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Supabase URL: ${process.env.SUPABASE_URL ? '✓ configured' : '✗ missing'}`);
  console.log(`  Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ configured' : '✗ missing'}`);
});
