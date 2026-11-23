require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');

const gamesRouter = require('./routes/games');
const profileRouter = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
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

// Serve frontend static files if built
const fs = require('fs');
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found. API routes start with /api/' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('*', (_req, res) => {
    res.status(404).json({ error: 'Not found. API routes start with /api/' });
  });
}

app.listen(PORT, () => {
  console.log(`✦ Around Us server running on http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Supabase URL: ${process.env.SUPABASE_URL ? '✓ configured' : '✗ missing'}`);
  console.log(`  Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ configured' : '✗ missing'}`);
});
