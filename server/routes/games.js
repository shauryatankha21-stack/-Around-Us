const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Create Supabase admin client (service role for server-side operations)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasConfig =
  supabaseUrl &&
  !supabaseUrl.includes('YOUR_') &&
  supabaseServiceKey &&
  !supabaseServiceKey.includes('YOUR_');

const supabaseAdmin = hasConfig
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

/**
 * Create a user-scoped Supabase client by forwarding the user's JWT.
 * This preserves RLS policies on the database.
 */
function getUserClient(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !hasConfig) return null;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: { Authorization: authHeader },
    },
  });
}

// GET /api/games — List all games
router.get('/', async (_req, res) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  const { data, error } = await supabaseAdmin
    .from('games')
    .select('*')
    .order('starts_at');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/games/counts — Get player counts per game
router.get('/counts', async (_req, res) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  const { data, error } = await supabaseAdmin.rpc('get_game_counts');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/games/my-games — Get games the current user has joined
router.get('/my-games', async (req, res) => {
  const userClient = getUserClient(req);
  if (!userClient) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Extract user ID from JWT
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { data, error } = await supabaseAdmin
    .from('game_players')
    .select('game_id')
    .eq('user_id', user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/games — Create a new game
router.post('/', async (req, res) => {
  const userClient = getUserClient(req);
  if (!userClient) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { title, icon, category, place, scope, starts_at, max_players, min_age, note } = req.body;

  const { data, error } = await supabaseAdmin
    .from('games')
    .insert({
      host_id: user.id,
      title,
      icon,
      category,
      place,
      scope,
      starts_at,
      status: 'upcoming',
      max_players,
      min_age: min_age || 16,
      note: note || 'Open to new players.',
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// POST /api/games/join — Join a game
router.post('/join', async (req, res) => {
  const userClient = getUserClient(req);
  if (!userClient) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Use RPC with the user's auth context
  const { data, error } = await userClient.rpc('join_game', {
    p_game_id: req.body.game_id,
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// POST /api/games/leave — Leave a game
router.post('/leave', async (req, res) => {
  const userClient = getUserClient(req);
  if (!userClient) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { data, error } = await userClient.rpc('leave_game', {
    p_game_id: req.body.game_id,
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
